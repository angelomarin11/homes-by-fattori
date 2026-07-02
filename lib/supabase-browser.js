// Client Supabase do NAVEGADOR (anon key — pública; RLS só permite leitura).
// Retorna null quando o projeto ainda não foi configurado: a página /d/[id]
// mostra instruções de setup em vez de quebrar.
import { createClient } from "@supabase/supabase-js";

let client;
export function getBrowserDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}
