// ============================================================================
//  /api/admin  ·  backend do painel do operador (app/admin)
//  Tudo protegido pelo DUELS_ADMIN_SECRET (header x-admin-secret).
//  GET  ?q=overview  → criadores + disputas com arrecadação + últimos gritos
//  POST {action:"create_creator"|"clear_cry"|"anon_buyer"}
//  (criar disputa continua no POST /api/duels, mesmo segredo)
// ============================================================================

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const authed = (req) => {
  const s = process.env.DUELS_ADMIN_SECRET;
  return !!s && req.headers.get("x-admin-secret") === s;
};
const deny = () => Response.json({ error: "não autorizado" }, { status: 401 });

export async function GET(req) {
  if (!authed(req)) return deny();
  const db = getDb();
  try {
    const [creators, duels, paid] = await Promise.all([
      db.from("creators").select("id, name, email, country, approved").order("created_at", { ascending: false }).limit(50),
      db.from("duels").select("id, title, side_a, side_b, status, currency, hold_hours, leading_side, hold_until, winner, created_at").order("created_at", { ascending: false }).limit(50),
      db.from("transactions").select("id, duel_id, buyer_name, side, gross, currency, kind, cry, crew, paid_at").eq("status", "paid").order("paid_at", { ascending: false }).limit(40),
    ]);
    // arrecadação por disputa (escala pequena: agrega as últimas pagas aqui)
    const totals = {};
    (paid.data || []).forEach(tx => {
      totals[tx.duel_id] = totals[tx.duel_id] || { gross: 0, count: 0 };
      totals[tx.duel_id].gross += Number(tx.gross);
      totals[tx.duel_id].count += 1;
    });
    return Response.json({
      creators: creators.data || [],
      duels: (duels.data || []).map(d => ({ ...d, ...totals[d.id] })),
      recent: paid.data || [],
    });
  } catch (e) {
    return Response.json({ error: "erro interno", detail: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  if (!authed(req)) return deny();
  const db = getDb();
  try {
    const body = await req.json();
    if (body.action === "create_creator") {
      const { name, email, country = "BR", pagarmeRecipientId, stripeAccountId } = body;
      if (!name || !email) return Response.json({ error: "nome e email obrigatórios" }, { status: 400 });
      const { data, error } = await db.from("creators").insert({
        name: String(name).slice(0, 60), email: String(email).slice(0, 120),
        country: String(country).slice(0, 2).toUpperCase(),
        pagarme_recipient_id: pagarmeRecipientId || null,
        stripe_account_id: stripeAccountId || null,
        approved: true, // criar pelo painel JÁ é o ato de curadoria
      }).select().single();
      if (error) return Response.json({ error: String(error.message) }, { status: 400 });
      return Response.json({ creator: data });
    }
    if (body.action === "clear_cry") {
      // moderação: remove o grito do mural na hora (a compra/blocos ficam)
      if (!body.txnId) return Response.json({ error: "txnId ausente" }, { status: 400 });
      await db.from("transactions").update({ cry: null }).eq("id", body.txnId);
      return Response.json({ ok: true });
    }
    if (body.action === "anon_buyer") {
      // moderação: anonimiza nome abusivo na transação E nos blocos cravados
      if (!body.txnId) return Response.json({ error: "txnId ausente" }, { status: 400 });
      await db.from("transactions").update({ buyer_name: "•••" }).eq("id", body.txnId);
      await db.from("blocks").update({ owner_name: "•••" }).eq("txn_id", body.txnId);
      return Response.json({ ok: true });
    }
    return Response.json({ error: "ação desconhecida" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: "erro interno", detail: String(e) }, { status: 500 });
  }
}
