// ============================================================================
//  api/check-wins.js  ·  CRON (roda a cada minuto via Vercel Cron)
//  Conclui disputas cujo prazo de 24h venceu E o líder ainda mantém a zona.
//  Isto roda no servidor — não depende de ninguém estar com a página aberta.
// ============================================================================

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const db = getDb();
  // proteja com um secret no header pra só o cron chamar
  if (req.headers.get("x-cron-secret") !== process.env.CRON_SECRET) return new Response("no", { status: 401 });

  const now = new Date().toISOString();
  const { data: due } = await db.from("duels")
    .select("*").eq("status", "active").not("hold_until", "is", null).lte("hold_until", now);

  for (const duel of due || []) {
    // confirma que o líder AINDA tem a zona (pode ter sido derrubado)
    const total = duel.grid * duel.grid;
    const { data: blocks } = await db.from("blocks").select("pos, side").eq("duel_id", duel.id);
    const map = new Map((blocks || []).map(b => [b.pos, b.side]));
    let cA = 0; for (let p = 0; p < total; p++) { const s = map.get(p) ?? ((p % duel.grid) < duel.grid / 2 ? "a" : "b"); if (s === "a") cA++; }
    const pctLeader = duel.leading_side === "a" ? Math.round(cA / total * 100) : 100 - Math.round(cA / total * 100);

    if (pctLeader >= duel.win_pct) {
      await db.from("duels").update({ status: "won", winner: duel.leading_side, won_at: now }).eq("id", duel.id);
    } else {
      // derrubado a tempo: zera
      await db.from("duels").update({ leading_side: null, hold_until: null }).eq("id", duel.id);
    }
  }
  return Response.json({ checked: (due || []).length });
}
