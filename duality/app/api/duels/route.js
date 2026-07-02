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
    // AUTORIZAÇÃO: publicar disputa é ação de operador (curadoria fechada).
    // Sem isto, qualquer um com o UUID de um criador aprovado publicaria splits
    // pra ele. Exige o segredo do painel — `approved` é gate de curadoria, não auth.
    const secret = process.env.DUELS_ADMIN_SECRET;
    if (!secret || req.headers.get("x-admin-secret") !== secret) {
      return Response.json({ error: "não autorizado" }, { status: 401 });
    }
    const { creatorId, title, sideA, sideB, colorA, colorB, imgA, imgB, currency = "BRL", basePrice = 2, skin, cries, victoryMsg } = await req.json();

    // só criadores aprovados publicam (curadoria fechada)
    const { data: creator } = await db.from("creators").select("approved").eq("id", creatorId).single();
    if (!creator?.approved) return Response.json({ error: "criador não aprovado" }, { status: 403 });

    // personalização do estúdio v2, sanitizada no servidor
    const cleanSkin = ["carvao", "neon", "ouro"].includes(skin) ? skin : "carvao";
    const cleanCries = Array.isArray(cries) ? cries.map(c => String(c).trim().slice(0, 80)).filter(Boolean).slice(0, 3) : [];
    const cleanVictory = typeof victoryMsg === "string" ? victoryMsg.trim().slice(0, 90) || null : null;

    const grid = 24;
    const { data: duel } = await db.from("duels").insert({
      creator_id: creatorId, title, side_a: sideA, side_b: sideB,
      color_a: colorA, color_b: colorB, img_a: imgA || null, img_b: imgB || null,
      grid, base_price: basePrice, currency,
      skin: cleanSkin, cries: cleanCries, victory_msg: cleanVictory,
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
