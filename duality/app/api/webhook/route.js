// ============================================================================
//  POST /api/webhook  ·  app/api/webhook/route.js
//  Confirma pagamento (Pagar.me ou Stripe), pinta os blocos da transação,
//  dobra o preço deles, atualiza ranking e dispara a lógica de vitória 24h.
//  Única fonte de verdade pra mudança de estado. Frontend nunca escreve.
// ============================================================================

import { getDb } from "@/lib/db";
import { verifyStripeSignature } from "@/lib/stripe-verify";
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
    // Stripe: HMAC do header stripe-signature com tolerância anti-replay
    const sig = req.headers.get("stripe-signature") || "";
    if (!verifyStripeSignature(raw, sig, process.env.STRIPE_WEBHOOK_SECRET)) return new Response("bad sig", { status: 401 });
    const ev = JSON.parse(raw);
    // Checkout hospedado emite checkout.session.completed; intents diretos, payment_intent.succeeded
    if (ev.type !== "checkout.session.completed" && ev.type !== "payment_intent.succeeded") return new Response("ignored", { status: 200 });
    txnId = ev.data?.object?.metadata?.txn_id;
  }
  if (!txnId) return new Response("no txn", { status: 200 });

  // 2. idempotência ATÔMICA: marca paid só se ainda estava pending. Duas entregas
  //    do mesmo evento (retry do gateway, ou session+intent do Stripe) correm juntas;
  //    só UMA vence o compare-and-swap e segue pra aplicar a compra.
  const { data: claimed } = await db.from("transactions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", txnId).eq("status", "pending")
    .select("*");
  const txn = claimed?.[0];
  if (!txn) return new Response("ok", { status: 200 });   // já processada ou inexistente

  const { data: duel } = await db.from("duels").select("*").eq("id", txn.duel_id).single();
  if (!duel) return new Response("ok", { status: 200 });
  const base = Number(duel.base_price);

  // 3. aplica a compra
  if (txn.kind === "eternal") {
    // escolhe o bloco central LIVRE mais próximo do centro (livre = sem dono e não-eterno)
    const { data: blocks } = await db.from("blocks").select("pos, owner_name, eternal").eq("duel_id", txn.duel_id);
    const byPos = new Map((blocks || []).map(b => [b.pos, b]));
    const g = duel.grid; let best = -1, bs = Infinity;
    for (let p = 0; p < g * g; p++) {
      const b = byPos.get(p);
      if (b?.eternal || b?.owner_name) continue;          // nunca rouba bloco já cravado/comprado
      const d = Math.abs((p % g) - g / 2) + Math.abs(((p / g) | 0) - g / 2);
      if (d < bs) { bs = d; best = p; }
    }
    // claim_eternal re-checa o teto DENTRO do banco: se esgotou entre o charge e
    // agora, retorna null e nada é cravado (operador reembolsa pela dashboard).
    if (best >= 0) {
      await db.rpc("claim_eternal", {
        p_duel: txn.duel_id, p_pos: best, p_side: txn.side,
        p_name: txn.buyer_name, p_flair: txn.flair || null, p_txn: txnId,
        p_cap: duel.eternal_cap,
      }).catch(() => {});
    }
  } else {
    // pinta cada bloco e DOBRA o preço dele — mas nunca sobrescreve um Eterno
    // que possa ter sido cravado entre o charge e a confirmação.
    const { data: existing } = await db.from("blocks").select("pos, price, eternal").eq("duel_id", txn.duel_id).in("pos", txn.positions);
    const byPos = new Map((existing || []).map(b => [b.pos, b]));
    const rows = txn.positions
      .filter(pos => !byPos.get(pos)?.eternal)
      .map(pos => {
        const cur = Number(byPos.get(pos)?.price ?? base);
        return { duel_id: txn.duel_id, pos, side: txn.side, owner_name: txn.buyer_name, flair: txn.flair || null, price: +(cur * 2).toFixed(2), txn_id: txnId, updated_at: new Date().toISOString() };
      });
    if (rows.length) await db.from("blocks").upsert(rows, { onConflict: "duel_id,pos" });

    // ranking (pontua os blocos que REALMENTE foram pintados)
    if (rows.length) await db.rpc("bump_contribution", { p_duel: txn.duel_id, p_name: txn.buyer_name, p_n: rows.length }).catch(() => {});
  }

  // equipe: soma pontos da tag (status coletivo — nunca payout), atômico no banco
  if (txn.crew) {
    const pts = txn.kind === "eternal" ? 5 : txn.positions.length;
    await db.rpc("bump_crew", { p_duel: txn.duel_id, p_tag: txn.crew, p_side: txn.side, p_n: pts }).catch(() => {});
  }
  // o grito (txn.cry) já está na transação paga — o mural lê de lá (view public_feed)

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
