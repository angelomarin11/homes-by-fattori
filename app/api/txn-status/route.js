// ============================================================================
//  GET /api/txn-status?id=<uuid>  ·  app/api/txn-status/route.js
//  Devolve só o status de UMA transação (pending|paid|failed|expired).
//  Existe porque a tabela `transactions` tem RLS ligada e o anon não a lê —
//  o polling do QR passa por aqui (service_role), sem expor valores/ledger/PII.
// ============================================================================

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id ausente" }, { status: 400 });
  try {
    const db = getDb();
    const { data } = await db.from("transactions").select("status").eq("id", id).single();
    if (!data) return Response.json({ status: null }, { status: 404 });
    return Response.json({ status: data.status });
  } catch {
    return Response.json({ error: "indisponível" }, { status: 503 });
  }
}
