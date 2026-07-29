/**
 * Etapa 3 — código de homologação ANATEL: extração no anúncio e verificação
 * contra a base pública de produtos homologados (dados abertos / SCH).
 *
 * Formato do código: HHHHH-AA-FFFFF (nº homologação - ano 2 díg. - cód. do
 * solicitante), exibido com variações de separador e zeros à esquerda.
 * Normalizamos para comparar: 5+2+5 dígitos concatenados.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CACHE_DIR, ensureCacheDir, fetchText, progress, ROOT } from './util.js';

// Padrão tolerante: 4-5 dígitos, separador, 2 dígitos, separador, 4-5 dígitos.
const CODE_RE = /\b(\d{4,5})\s*[-–./\\ ]\s*(\d{2})\s*[-–./\\ ]\s*(\d{4,5})\b/g;

export function normalizeCode(a, b, c) {
  return `${a.padStart(5, '0')}${b}${c.padStart(5, '0')}`;
}

export function formatCode(normalized) {
  return `${normalized.slice(0, 5)}-${normalized.slice(5, 7)}-${normalized.slice(7)}`;
}

/** Extrai códigos candidatos de um texto livre. */
export function extractCodes(text) {
  const out = new Set();
  for (const m of String(text ?? '').matchAll(CODE_RE)) {
    // filtra datas óbvias tipo 01-01-2024 / 2024-01-01
    if (m[1].length === 4 && Number(m[1]) >= 1900 && Number(m[1]) <= 2099) continue;
    if (m[3].length === 4 && Number(m[3]) >= 1900 && Number(m[3]) <= 2099) continue;
    out.add(normalizeCode(m[1], m[2], m[3]));
  }
  return [...out];
}

/** Procura código nos atributos do ML e no texto (título + descrição). */
export function findHomologationCode(item, detail, description) {
  const attrs = [...(item.attributes ?? []), ...((detail?.attributes) ?? [])];
  for (const a of attrs) {
    const idName = `${a?.id ?? ''} ${a?.name ?? ''}`.toLowerCase();
    if (idName.includes('anatel') || idName.includes('homolog')) {
      const codes = extractCodes(a?.value_name ?? '');
      if (codes.length) return { code: codes[0], fonte: 'atributo do anúncio' };
      // valor sem separadores: 11-12 dígitos corridos
      const digits = String(a?.value_name ?? '').replace(/\D/g, '');
      if (digits.length === 11 || digits.length === 12) {
        return { code: digits.padStart(12, '0'), fonte: 'atributo do anúncio' };
      }
    }
  }
  const inTitle = extractCodes(item.title);
  if (inTitle.length) return { code: inTitle[0], fonte: 'título' };
  const near = String(description ?? '');
  // na descrição, só aceitamos código próximo da palavra "anatel"/"homolog" —
  // números soltos demais geram falso positivo
  const anchor = near.toLowerCase().search(/anatel|homolog/);
  if (anchor >= 0) {
    const windowText = near.slice(Math.max(0, anchor - 200), anchor + 300);
    const codes = extractCodes(windowText);
    if (codes.length) return { code: codes[0], fonte: 'descrição' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Base de produtos homologados (CSV dados abertos ANATEL)
// ---------------------------------------------------------------------------

const DEFAULT_CSV_URLS = [
  // Dados abertos ANATEL — certificação de produtos (nome/caminho pode mudar;
  // configurável via ANATEL_CSV_URL no .env)
  'https://www.anatel.gov.br/dadosabertos/PDA/Certificacao_de_Produtos/Produtos_Certificados.csv',
  'https://www.anatel.gov.br/dadosabertos/PDA/certificacao_de_produtos/produtos_certificados.csv',
];

const CSV_CACHE = 'anatel_sch.csv';
const CSV_MAX_AGE = 7 * 24 * 3600 * 1000; // 7 dias

async function downloadCsv() {
  const urls = process.env.ANATEL_CSV_URL ? [process.env.ANATEL_CSV_URL] : DEFAULT_CSV_URLS;
  for (const url of urls) {
    try {
      progress(`Baixando base ANATEL: ${url}`);
      const text = await fetchText(url, { retries: 1 });
      if (text && text.length > 1000) return text;
    } catch (err) {
      progress(`  falhou (${err.message.slice(0, 120)})`);
    }
  }
  return null;
}

/**
 * Constrói o índice de códigos homologados.
 * O parser tolera ; ou , como separador e localiza a coluna pelo header
 * (contendo "homolog"). Encoding: tenta UTF-8; se aparecer � em massa, latin1.
 */
export function parseCsvCodes(text) {
  const firstNl = text.indexOf('\n');
  const header = text.slice(0, firstNl);
  const sep = (header.match(/;/g)?.length ?? 0) >= (header.match(/,/g)?.length ?? 0) ? ';' : ',';
  const cols = header.split(sep).map((c) => c.trim().toLowerCase().replace(/^"|"$/g, ''));
  let idx = cols.findIndex((c) => c.includes('homolog'));
  if (idx < 0) idx = cols.findIndex((c) => c.includes('certificado'));
  if (idx < 0) idx = 0;

  const codes = new Set();
  let pos = firstNl + 1;
  while (pos < text.length) {
    let end = text.indexOf('\n', pos);
    if (end < 0) end = text.length;
    const line = text.slice(pos, end);
    pos = end + 1;
    if (!line.trim()) continue;
    const cell = (line.split(sep)[idx] ?? '').replace(/"/g, '').trim();
    const digits = cell.replace(/\D/g, '');
    if (digits.length >= 11 && digits.length <= 12) {
      codes.add(digits.padStart(12, '0'));
    } else {
      // célula no formato NNNNN-NN-NNNNN com zeros suprimidos
      const parts = cell.split(/[-./]/).map((p) => p.trim());
      if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
        codes.add(normalizeCode(parts[0], parts[1].padStart(2, '0'), parts[2]));
      }
    }
  }
  return codes;
}

/**
 * Carrega a base (cache local → download). Em --mock usa fixtures/anatel_sample.csv.
 * Retorna { disponivel, codes, origem }.
 */
export async function loadAnatelBase({ mock = false } = {}) {
  if (mock) {
    const text = fs.readFileSync(path.join(ROOT, 'fixtures', 'anatel_sample.csv'), 'utf8');
    return { disponivel: true, codes: parseCsvCodes(text), origem: 'fixture local (mock)' };
  }
  ensureCacheDir();
  const cachePath = path.join(CACHE_DIR, CSV_CACHE);
  if (fs.existsSync(cachePath) && Date.now() - fs.statSync(cachePath).mtimeMs < CSV_MAX_AGE) {
    const text = fs.readFileSync(cachePath, 'utf8');
    return { disponivel: true, codes: parseCsvCodes(text), origem: 'cache local' };
  }
  const text = await downloadCsv();
  if (text) {
    fs.writeFileSync(cachePath, text);
    return { disponivel: true, codes: parseCsvCodes(text), origem: 'download dados abertos ANATEL' };
  }
  if (fs.existsSync(cachePath)) {
    const stale = fs.readFileSync(cachePath, 'utf8');
    return { disponivel: true, codes: parseCsvCodes(stale), origem: 'cache local (desatualizado)' };
  }
  return { disponivel: false, codes: new Set(), origem: null };
}

/** Verifica um código normalizado contra a base. */
export function verifyCode(code, base) {
  if (!base.disponivel) return 'base_indisponivel';
  if (base.codes.has(code)) return 'valido';
  // tolerância a zeros à esquerda divergentes
  const trimmed = code.replace(/^0+/, '');
  for (const c of base.codes) {
    if (c.replace(/^0+/, '') === trimmed) return 'valido';
  }
  return 'nao_encontrado';
}
