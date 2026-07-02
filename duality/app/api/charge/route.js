// ============================================================================
//  POST /api/charge  ·  app/api/charge/route.js
//  Recebe: { duelId, side, budget, kind, buyerName, ref }
//  Calcula no SERVIDOR quais blocos e quanto custa (com handicap/zona),
//  cria a transação pending e gera o pagamento no gateway certo.
// ============================================================================

import { getDb } from "@/lib/db";
import { gatewayFor, computeSplit, createPixOrder, createStripeCheckout } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const db = getDb();
  try {
    const { duelId, side, budget, kind = "blocks", buyerName, ref, cry, crew, flair } = await req.json();
    if (!["a", "b"].includes(side)) return bad("side inválido");
    if (!["blocks", "eternal"].includes(kind)) return bad("kind inválido");

    // orçamento: número finito e positivo, com teto (NaN/negativo/gigante furam o
    // limite de gasto — sem isso um NaN faz `spent > NaN` ser sempre falso e cobra
    // o mapa inteiro). Só importa pra compra de blocos; Eterno tem preço fixo.
    let budgetNum = 0;
    if (kind === "blocks") {
      budgetNum = Number(budget);
      if (!Number.isFinite(budgetNum) || budgetNum < 1) return bad("orçamento inválido");
      budgetNum = Math.min(budgetNum, 100000);
    }

    // extras sociais — sanitizados no servidor (o frontend nunca é fonte de verdade)
    const cleanCry = typeof cry === "string" ? cry.trim().slice(0, 80) || null : null;
    const cleanCrew = typeof crew === "string" ? (crew.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || null) : null;
    if (cleanCrew && cleanCrew.length < 2) return bad("tag de equipe inválida");
    const cleanFlair = typeof flair === "string" ? [...flair.trim()].slice(0, 2).join("") || null : null;

    const { data: duel } = await db.from("duels")
      .select("*, creators(country, pagarme_recipient_id, stripe_account_id)")
      .eq("id", duelId).eq("status", "active").single();
    if (!duel) return bad("disputa não encontrada ou encerrada", 404);

    const total = duel.grid * duel.grid;
    const { data: blocks } = await db.from("blocks").select("pos, side, price, eternal").eq("duel_id", duelId);
    const map = new Map((blocks || []).map(b => [b.pos, b]));
    const sideAt = (p) => map.get(p)?.side ?? ((p % duel.grid) < duel.grid / 2 ? "a" : "b");

    // percentual atual do lado escolhido
    let cA = 0; for (let p = 0; p < total; p++) if (sideAt(p) === "a") cA++;
    const pctSide = side === "a" ? Math.round(cA / total * 100) : 100 - Math.round(cA / total * 100);

    // fator de preço: handicap (atrás = desconto) ou zona de vitória (líder = 2x)
    const behind = Math.max(0, 50 - pctSide);
    const handicap = 1 - Math.min(0.5, behind / 100);
    const factor = pctSide >= duel.win_pct ? 2 : handicap;

    let gross, positions = [];
    if (kind === "eternal") {
      // escassez real: conta eternos já vendidos
      const { count } = await db.from("blocks").select("*", { count: "exact", head: true }).eq("duel_id", duelId).eq("eternal", true);
      if ((count || 0) >= duel.eternal_cap) return bad("eternos esgotados", 409);
      gross = Number(duel.eternal_price);
    } else {
      // escolhe os blocos inimigos mais baratos até o orçamento
      const opp = side === "a" ? "b" : "a";
      const cand = [];
      for (let p = 0; p < total; p++) {
        const b = map.get(p);
        if (b?.eternal) continue;
        if (sideAt(p) === opp) {
          const basePrice = b?.price ?? Number(duel.base_price);
          cand.push({ pos: p, cost: +(basePrice * factor).toFixed(2) });
        }
      }
      cand.sort((x, y) => x.cost - y.cost);
      let spent = 0;
      for (const c of cand) { if (spent + c.cost > budgetNum + 1e-9) continue; spent += c.cost; positions.push(c.pos); }
      if (positions.length === 0) return bad("orçamento insuficiente pra tomar algum bloco", 422);
      gross = +spent.toFixed(2);
    }

    const { creatorCut, platformCut } = computeSplit(gross);
    const gateway = gatewayFor(duel.currency);

    const { data: txn } = await db.from("transactions").insert({
      duel_id: duelId, side, kind, positions, buyer_name: buyerName || "Anon",
      gross, creator_cut: creatorCut, platform_cut: platformCut,
      currency: duel.currency, gateway, ref: ref || null, status: "pending",
      cry: cleanCry, crew: cleanCrew, flair: cleanFlair,
    }).select().single();

    // gera o pagamento no gateway certo
    let pay;
    if (gateway === "pix") {
      pay = await createPixOrder({
        gross, currency: duel.currency, description: `${duel.title} · ${side}`,
        txnId: txn.id, creatorRecipient: duel.creators.pagarme_recipient_id, positions,
      });
    } else {
      // volta pro link público da disputa depois do checkout hospedado.
      // NUNCA confia no header Origin cru (open-redirect/phishing): usa o site
      // oficial e só aceita o Origin se ele bater com ele.
      const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
      const origin = req.headers.get("origin");
      const base = origin === site ? origin : site;
      pay = await createStripeCheckout({
        gross, currency: duel.currency, description: `${duel.title} · ${side === "a" ? duel.side_a : duel.side_b}`,
        txnId: txn.id, creatorAccount: duel.creators.stripe_account_id,
        returnUrl: `${base}/d/${duelId}`,
      });
    }
    await db.from("transactions").update({ gateway_id: pay.gatewayId }).eq("id", txn.id);

    return Response.json({ txnId: txn.id, gateway, gross, ...pay });
  } catch (e) {
    return Response.json({ error: "erro interno", detail: String(e) }, { status: 500 });
  }
}
const bad = (m, s = 400) => Response.json({ error: m }, { status: s });
