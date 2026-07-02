// ============================================================================
//  POST /api/webhook  ·  app/api/webhook/route.js
//  Confirma pagamento (Pagar.me ou Stripe), pinta os blocos da transação,
//  dobra o preço deles, atualiza ranking e dispara a lógica de vitória 24h.
//  Única fonte de verdade pra mudança de estado. Frontend nunca escreve.
// ============================================================================

import { getDb } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const db = getDb();
  const raw = await req.text();
  const source = req.headers.get("x-hub-signature") ? "pagarme" : "stripe";

  // 1. valida assinatura do gateway
  let txnId;
  if (source === "pagarme") {
    const sig = req.headers.get("x-hub-signature") || "";
    const expected = "sha256=" + crypto.createHmac("sha256", process.env.PAGARME_WEBHOOK_SECRET).update(raw).digest("hex");
    if (sig !== expected) return new Response("bad sig", { status: 401 });
    const ev = JSON.parse(raw);
    if (ev.type !== "order.paid" && ev.type !== "charge.paid") return new Response("ignored", { status: 200 });
    txnId = ev.data?.metadata?.txn_id;
  } else {
    // Stripe: validar com stripe-signature (simplificado; em produção use a lib oficial)
    const ev = JSON.parse(raw);
    if (ev.type !== "payment_intent.succeeded") return new Response("ignored", { status: 200 });
    txnId = ev.data?.object?.metadata?.txn_id;
  }
  if (!txnId) return new Response("no txn", { status: 200 });

  // 2. idempotência
  const { data: txn } = await db.from("transactions").select("*").eq("id", txnId).single();
  if (!txn || txn.status === "paid") return new Response("ok", { status: 200 });
  await db.from("transactions").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", txnId);

  const { data: duel } = await db.from("duels").select("*").eq("id", txn.duel_id).single();
  const base = Number(duel.base_price);

  // 3. aplica a compra
  if (txn.kind === "eternal") {
    // crava 1 bloco central livre como eterno
    const { data: blocks } = await db.from("blocks").select("pos, eternal").eq("duel_id", txn.duel_id);
    const taken = new Set((blocks || []).map(b => b.pos));
    const g = duel.grid; let best = -1, bs = Infinity;
    for (let p = 0; p < g * g; p++) {
      const eternal = (blocks || []).find(b => b.pos === p)?.eternal;
      if (eternal) continue;
      const d = Math.abs((p % g) - g / 2) + Math.abs(((p / g) | 0) - g / 2);
      if (d < bs) { bs = d; best = p; }
    }
    if (best >= 0) await db.from("blocks").upsert({ duel_id: txn.duel_id, pos: best, side: txn.side, owner_name: txn.buyer_name, flair: txn.flair || null, price: 999999, eternal: true, txn_id: txnId }, { onConflict: "duel_id,pos" });
  } else {
    // pinta cada bloco e DOBRA o preço dele
    const { data: existing } = await db.from("blocks").select("pos, price").eq("duel_id", txn.duel_id).in("pos", txn.positions);
    const priceMap = new Map((existing || []).map(b => [b.pos, Number(b.price)]));
    const rows = txn.positions.map(pos => {
      const cur = priceMap.get(pos) ?? base;
      return { duel_id: txn.duel_id, pos, side: txn.side, owner_name: txn.buyer_name, flair: txn.flair || null, price: +(cur * 2).toFixed(2), txn_id: txnId, updated_at: new Date().toISOString() };
    });
    if (rows.length) await db.from("blocks").upsert(rows, { onConflict: "duel_id,pos" });

    // ranking
    await db.rpc("bump_contribution", { p_duel: txn.duel_id, p_name: txn.buyer_name, p_n: txn.positions.length }).catch(() => {});
  }

  // equipe: soma pontos da tag (status coletivo — nunca payout)
  if (txn.crew) {
    const pts = txn.kind === "eternal" ? 5 : txn.positions.length;
    const { data: crewRow } = await db.from("crews").select("points").eq("duel_id", txn.duel_id).eq("tag", txn.crew).single();
    await db.from("crews").upsert(
      { duel_id: txn.duel_id, tag: txn.crew, side: txn.side, points: (crewRow?.points || 0) + pts },
      { onConflict: "duel_id,tag" }
    );
  }
  // o grito (txn.cry) já está na transação paga — o mural lê de lá

  // 4. lógica de vitória sustentada 24h
  await updateWinState(txn.duel_id);

  return new Response("ok", { status: 200 });
}

// avalia se algum lado entrou/saiu da zona de vitória e marca/zera o prazo
async function updateWinState(duelId) {
  const db = getDb();
  const { data: duel } = await db.from("duels").select("*").eq("id", duelId).single();
  if (duel.status !== "active") return;
  const total = duel.grid * duel.grid;
  const { data: blocks } = await db.from("blocks").select("pos, side").eq("duel_id", duelId);
  const map = new Map((blocks || []).map(b => [b.pos, b.side]));
  let cA = 0; for (let p = 0; p < total; p++) { const s = map.get(p) ?? ((p % duel.grid) < duel.grid / 2 ? "a" : "b"); if (s === "a") cA++; }
  const pctA = Math.round(cA / total * 100);
  const leader = pctA >= duel.win_pct ? "a" : (100 - pctA) >= duel.win_pct ? "b" : null;

  if (!leader) {
    // ninguém na zona: zera o prazo
    if (duel.leading_side) await db.from("duels").update({ leading_side: null, hold_until: null }).eq("id", duelId);
  } else if (leader !== duel.leading_side) {
    // novo líder na zona: inicia prazo de 24h
    const until = new Date(Date.now() + duel.hold_hours * 3600 * 1000).toISOString();
    await db.from("duels").update({ leading_side: leader, hold_until: until }).eq("id", duelId);
  }
  // a CONCLUSÃO da vitória (quando o prazo vence) é feita pelo cron — ver api/check-wins.js
}
