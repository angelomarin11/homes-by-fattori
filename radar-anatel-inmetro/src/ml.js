/**
 * Cliente da API pública do Mercado Livre (site MLB).
 *
 * Estratégia de auth: tenta sem token; se receber 401/403, tenta obter um
 * token de aplicação (ML_ACCESS_TOKEN direto, ou client_credentials com
 * ML_CLIENT_ID/ML_CLIENT_SECRET) e repete com Authorization: Bearer.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, fetchJson, FetchError, chunk, progress, sleep } from './util.js';

const API = 'https://api.mercadolibre.com';
const PAGE_SIZE = 50;
const PUBLIC_OFFSET_CAP = 1000; // a busca pública não pagina além de ~1000 resultados

let bearerToken = null;
let triedAuth = false;

async function getToken() {
  if (bearerToken) return bearerToken;
  if (process.env.ML_ACCESS_TOKEN) {
    bearerToken = process.env.ML_ACCESS_TOKEN;
    return bearerToken;
  }
  const { ML_CLIENT_ID, ML_CLIENT_SECRET } = process.env;
  if (ML_CLIENT_ID && ML_CLIENT_SECRET) {
    const res = await fetchJson(`${API}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
      }).toString(),
    });
    bearerToken = res.access_token;
    return bearerToken;
  }
  return null;
}

async function mlGet(pathAndQuery) {
  const url = `${API}${pathAndQuery}`;
  const headers = bearerToken ? { authorization: `Bearer ${bearerToken}` } : {};
  try {
    return await fetchJson(url, { headers });
  } catch (err) {
    const blocked = err instanceof FetchError && (err.status === 401 || err.status === 403);
    if (blocked && !triedAuth) {
      triedAuth = true;
      const token = await getToken();
      if (token) {
        progress('API do ML exigiu autenticação — repetindo com token de aplicação…');
        return fetchJson(url, { headers: { authorization: `Bearer ${token}` } });
      }
      throw new Error(
        'A API do Mercado Livre bloqueou a chamada sem autenticação e não há credenciais no .env.\n' +
          'Crie uma aplicação em https://developers.mercadolivre.com.br e preencha ML_CLIENT_ID/ML_CLIENT_SECRET ' +
          '(ou ML_ACCESS_TOKEN) no .env.'
      );
    }
    throw err;
  }
}

/** Resolve nickname → dados do seller (via primeira página da busca). */
export async function resolveSeller(nickname) {
  const q = /^\d+$/.test(nickname)
    ? `seller_id=${nickname}`
    : `nickname=${encodeURIComponent(nickname)}`;
  const data = await mlGet(`/sites/MLB/search?${q}&limit=1`);
  const seller = data?.seller ?? data?.results?.[0]?.seller;
  if (!seller?.id) {
    throw new Error(
      `Nenhum anúncio ativo encontrado para "${nickname}". Confira o nickname exato da loja (como aparece no perfil do ML).`
    );
  }
  return {
    id: seller.id,
    nickname: seller.nickname ?? nickname,
    permalink: seller.permalink ?? null,
    total: data?.paging?.total ?? null,
  };
}

/** Pagina todos os itens ativos do seller. */
export async function fetchAllItems(sellerId, { maxItems = Infinity, onPage } = {}) {
  const items = [];
  let offset = 0;
  let total = null;
  let truncated = false;
  while (true) {
    const data = await mlGet(`/sites/MLB/search?seller_id=${sellerId}&limit=${PAGE_SIZE}&offset=${offset}`);
    total = data?.paging?.total ?? total;
    for (const r of data?.results ?? []) {
      items.push({
        id: r.id,
        title: r.title,
        category_id: r.category_id,
        price: r.price ?? null,
        sold_quantity: r.sold_quantity ?? null,
        permalink: r.permalink ?? null,
        thumbnail: r.thumbnail ?? null,
        attributes: r.attributes ?? [],
      });
    }
    onPage?.(items.length, total);
    offset += PAGE_SIZE;
    if (items.length >= maxItems) break;
    if (!data?.results?.length || offset >= (total ?? 0)) break;
    if (offset >= PUBLIC_OFFSET_CAP) {
      truncated = true;
      break;
    }
    await sleep(150); // gentileza com a API
  }
  return { items: items.slice(0, maxItems === Infinity ? undefined : maxItems), total, truncated };
}

/** Multiget de detalhes (start_time, atributos completos) — 20 por chamada. */
export async function fetchItemDetails(ids, { onBatch } = {}) {
  const out = new Map();
  const batches = chunk(ids, 20);
  for (let i = 0; i < batches.length; i++) {
    const data = await mlGet(
      `/items?ids=${batches[i].join(',')}&attributes=id,start_time,attributes,price,sold_quantity,permalink,title,category_id`
    );
    for (const entry of data ?? []) {
      if (entry?.code === 200 && entry.body) out.set(entry.body.id, entry.body);
    }
    onBatch?.(i + 1, batches.length);
    await sleep(150);
  }
  return out;
}

/** Descrição textual de um item (público). */
export async function fetchDescription(itemId) {
  try {
    const data = await mlGet(`/items/${itemId}/description`);
    return data?.plain_text ?? '';
  } catch {
    return '';
  }
}

const categoryCache = new Map();
/** Caminho da categoria (nomes), com cache em memória. */
export async function fetchCategoryPath(categoryId) {
  if (!categoryId) return [];
  if (categoryCache.has(categoryId)) return categoryCache.get(categoryId);
  try {
    const data = await mlGet(`/categories/${categoryId}`);
    const names = (data?.path_from_root ?? []).map((c) => c.name);
    categoryCache.set(categoryId, names);
    return names;
  } catch {
    categoryCache.set(categoryId, []);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Modo mock (fixtures locais) — pipeline completo sem rede.
// ---------------------------------------------------------------------------

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'fixtures', name), 'utf8'));
}

export function mockClient() {
  const seller = loadFixture('seller.json');
  const items = loadFixture('items.json');
  const details = loadFixture('item-details.json');
  const categories = loadFixture('categories.json');
  const descriptions = loadFixture('descriptions.json');
  return {
    resolveSeller: async () => seller,
    fetchAllItems: async (_id, { maxItems = Infinity } = {}) => ({
      items: items.slice(0, maxItems === Infinity ? undefined : maxItems),
      total: items.length,
      truncated: false,
    }),
    fetchItemDetails: async (ids) => {
      const m = new Map();
      for (const id of ids) if (details[id]) m.set(id, details[id]);
      return m;
    },
    fetchDescription: async (id) => descriptions[id] ?? '',
    fetchCategoryPath: async (catId) => categories[catId] ?? [],
  };
}

export function realClient() {
  return { resolveSeller, fetchAllItems, fetchItemDetails, fetchDescription, fetchCategoryPath };
}
