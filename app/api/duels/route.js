// ============================================================================
//  POST /api/duels  ·  app/api/duels/route.js
//  Cria uma disputa (vinda do painel do criador APROVADO) e semeia os blocos.
//  Retorna o id → o link público é /d/{id}.
// ============================================================================

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const db = getDb();
  try {
    const { creatorId, title, sideA, sideB, colorA, colorB, imgA, imgB, currency = "BRL", basePrice = 2 } = await req.json();

    // só criadores aprovados publicam (curadoria fechada)
    const { data: creator } = await db.from("creators").select("approved").eq("id", creatorId).single();
    if (!creator?.approved) return Response.json({ error: "criador não aprovado" }, { status: 403 });

    const grid = 24;
    const { data: duel } = await db.from("duels").insert({
      creator_id: creatorId, title, side_a: sideA, side_b: sideB,
      color_a: colorA, color_b: colorB, img_a: imgA || null, img_b: imgB || null,
      grid, base_price: basePrice, currency,
    }).select().single();

    // semeia os blocos: metade A, metade B, preço base
    const rows = [];
    for (let p = 0; p < grid * grid; p++) {
      rows.push({ duel_id: duel.id, pos: p, side: (p % grid) < grid / 2 ? "a" : "b", price: basePrice });
    }
    // insere em lotes (Supabase aceita ~1000 por vez)
    for (let i = 0; i < rows.length; i += 500) await db.from("blocks").insert(rows.slice(i, i + 500));

    return Response.json({ id: duel.id, url: `/d/${duel.id}` });
  } catch (e) {
    return Response.json({ error: "erro interno", detail: String(e) }, { status: 500 });
  }
}
