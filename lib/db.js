// Client Supabase (service_role — SÓ no servidor), criado sob demanda.
// Lazy de propósito: no escopo do módulo quebraria o `next build` em
// ambientes sem as env vars (CI, preview) antes de qualquer request.
import { createClient } from "@supabase/supabase-js";

let client;
export function getDb() {
  if (!client) client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  return client;
}
