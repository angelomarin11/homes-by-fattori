#!/usr/bin/env node
/**
 * Diagnóstico de viabilidade — testa cada rota de dados na prática e diz
 * qual modelo de negócio funciona HOJE a partir da sua rede/credenciais.
 *
 *   node doctor.js                      (testes básicos)
 *   node doctor.js --seller "nickname"  (testa busca por seller específico)
 *   node doctor.js --item MLB123456789  (testa leitura pública de um item)
 *
 * Interpretação impressa no final.
 */
import { loadEnv, fetchJson, fetchBuffer, FetchError } from './src/util.js';

loadEnv();

const API = 'https://api.mercadolibre.com';
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--seller') args.seller = process.argv[++i];
  if (process.argv[i] === '--item') args.item = process.argv[++i];
}

const results = [];
function ok(name, detail = '') { results.push({ name, ok: true, detail }); console.log(`  ✔ ${name}${detail ? ` — ${detail}` : ''}`); }
function fail(name, detail = '') { results.push({ name, ok: false, detail }); console.log(`  ✖ ${name}${detail ? ` — ${detail}` : ''}`); }
const httpMsg = (e) => (e instanceof FetchError ? `HTTP ${e.status}` : String(e.message).slice(0, 80));

async function getAppToken() {
  const { ML_CLIENT_ID, ML_CLIENT_SECRET } = process.env;
  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET) return null;
  try {
    const r = await fetchJson(`${API}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: ML_CLIENT_ID, client_secret: ML_CLIENT_SECRET }).toString(),
      retries: 0,
    });
    return r.access_token ?? null;
  } catch {
    return null;
  }
}

async function main() {
  console.log('\n═══ RADAR CONFORMIDADE — DIAGNÓSTICO DE VIABILIDADE ═══\n');
  let firstItemId = null;

  // ── 1. Busca pública do ML (a rota da prospecção outbound) ──────────────
  console.log('1) Busca pública do Mercado Livre (/sites/MLB/search)');
  try {
    const r = await fetchJson(`${API}/sites/MLB/search?q=fone%20bluetooth&limit=2`, { retries: 0 });
    firstItemId = r?.results?.[0]?.id ?? null;
    ok('busca pública SEM token', `${r?.paging?.total ?? '?'} resultados`);
  } catch (e) {
    fail('busca pública SEM token', httpMsg(e));
  }

  const appToken = await getAppToken();
  console.log(`\n2) Token de aplicação (client_credentials): ${appToken ? 'obtido ✔' : 'não configurado/falhou'}`);
  if (appToken) {
    try {
      const r = await fetchJson(`${API}/sites/MLB/search?q=fone%20bluetooth&limit=2`, {
        headers: { authorization: `Bearer ${appToken}` }, retries: 0,
      });
      firstItemId = firstItemId ?? r?.results?.[0]?.id ?? null;
      ok('busca pública COM token de app', `${r?.paging?.total ?? '?'} resultados`);
    } catch (e) {
      fail('busca pública COM token de app', httpMsg(e));
    }
  }

  if (args.seller) {
    console.log(`\n3) Busca por seller "${args.seller}"`);
    const q = /^\d+$/.test(args.seller) ? `seller_id=${args.seller}` : `nickname=${encodeURIComponent(args.seller)}`;
    for (const [label, headers] of [
      ['sem token', {}],
      ...(appToken ? [['com token de app', { authorization: `Bearer ${appToken}` }]] : []),
    ]) {
      try {
        const r = await fetchJson(`${API}/sites/MLB/search?${q}&limit=2`, { headers, retries: 0 });
        const n = r?.paging?.total ?? 0;
        if (n > 0) ok(`itens do seller ${label}`, `${n} anúncios visíveis`);
        else fail(`itens do seller ${label}`, 'endpoint respondeu, mas 0 resultados (filtrado?)');
      } catch (e) {
        fail(`itens do seller ${label}`, httpMsg(e));
      }
    }
  }

  // ── 4. Leitura pública de item (hidratação de IDs colhidos fora da API) ─
  const itemId = args.item ?? firstItemId;
  console.log(`\n4) Leitura de item ${itemId ? `(${itemId})` : '(sem ID — passe --item MLBxxxx)'}`);
  if (itemId) {
    for (const [label, headers] of [
      ['sem token', {}],
      ...(appToken ? [['com token de app', { authorization: `Bearer ${appToken}` }]] : []),
    ]) {
      try {
        const r = await fetchJson(`${API}/items/${itemId}?attributes=id,title,category_id,price,sold_quantity`, { headers, retries: 0 });
        if (r?.id) { ok(`/items ${label}`, r.title?.slice(0, 40)); break; }
        fail(`/items ${label}`, 'resposta sem id');
      } catch (e) {
        fail(`/items ${label}`, httpMsg(e));
      }
    }
  }

  // ── 5. Conta do vendedor autenticado (rota inbound/diagnóstico) ─────────
  console.log('\n5) Token de vendedor (ML_ACCESS_TOKEN → /users/me)');
  if (process.env.ML_ACCESS_TOKEN) {
    try {
      const me = await fetchJson(`${API}/users/me`, { headers: { authorization: `Bearer ${process.env.ML_ACCESS_TOKEN}` }, retries: 0 });
      ok('conta autenticada', `${me.nickname} (id ${me.id})`);
    } catch (e) {
      fail('conta autenticada', `${httpMsg(e)} — token expirado? (validade ~6h; use refresh_token)`);
    }
  } else {
    fail('conta autenticada', 'ML_ACCESS_TOKEN não configurado');
  }

  // ── 6. Base ANATEL ──────────────────────────────────────────────────────
  console.log('\n6) Base pública ANATEL (produtos homologados)');
  const urls = process.env.ANATEL_CSV_URL
    ? [process.env.ANATEL_CSV_URL]
    : [
        'https://www.anatel.gov.br/dadosabertos/paineis_de_dados/certificacao_de_produtos/produtos_certificados.zip',
        'https://www.anatel.gov.br/dadosabertos/paineis_de_dados/certificacao_de_produtos/produtos_certificados.csv',
        'https://www.anatel.gov.br/dadosabertos/PDA/Certificacao_de_Produtos/Produtos_Certificados.csv',
      ];
  let anatelOk = false;
  for (const url of urls) {
    if (!/^https?:/.test(url)) continue;
    try {
      const buf = await fetchBuffer(url, { retries: 0 });
      if (buf.length > 1000) { ok('download da base', `${url.split('/').pop()} (${(buf.length / 1e6).toFixed(1)} MB)`); anatelOk = true; break; }
      fail('download da base', `${url} → arquivo suspeito (${buf.length} bytes)`);
    } catch (e) {
      fail(`download ${url.split('/').pop()}`, httpMsg(e));
    }
  }
  if (!anatelOk) console.log('    → plano B garantido: baixar 1× no navegador e apontar ANATEL_CSV_URL para o arquivo local.');

  // ── Veredito ────────────────────────────────────────────────────────────
  const has = (n) => results.some((r) => r.ok && r.name.includes(n));
  console.log('\n═══ VEREDITO ═══\n');
  const outbound = has('busca pública');
  const hydrate = has('/items');
  const inbound = has('conta autenticada');
  console.log(`  Prospecção OUTBOUND via API (caçar lojas alheias em lote):   ${outbound ? '✅ VIÁVEL' : '❌ BLOQUEADA hoje'}`);
  console.log(`  HÍBRIDO (IDs colhidos das páginas públicas + análise via API): ${hydrate ? '✅ VIÁVEL' : outbound ? '✅ (via busca)' : '❌ testar com --item'}`);
  console.log(`  INBOUND (seller autoriza e recebe diagnóstico):               ${inbound ? '✅ VIÁVEL' : '⚠ falta ML_ACCESS_TOKEN para confirmar'}`);
  console.log(`  Verificação ANATEL automática:                                ${anatelOk ? '✅ VIÁVEL' : '⚠ usar download manual (plano B)'}`);
  console.log('\n  Leia docs/proposta-comercial.md e o README para o mapeamento modelo → rota de dados.\n');
}

main().catch((e) => {
  console.error(`✖ diagnóstico abortou: ${e.message}`);
  process.exit(1);
});
