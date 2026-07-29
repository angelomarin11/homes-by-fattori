import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CACHE_DIR = path.join(ROOT, 'cache');

export function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Node < 21.7: parser manual simples
      for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

export function ensureCacheDir() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function readCache(name, maxAgeMs = Infinity) {
  const p = path.join(CACHE_DIR, name);
  if (!fs.existsSync(p)) return null;
  if (Date.now() - fs.statSync(p).mtimeMs > maxAgeMs) return null;
  return fs.readFileSync(p, 'utf8');
}

export function writeCache(name, data) {
  ensureCacheDir();
  fs.writeFileSync(path.join(CACHE_DIR, name), data);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch com retry/backoff. Lança FetchError com .status em erro HTTP.
 */
export class FetchError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(url, { headers = {}, retries = 3, method = 'GET', body } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { method, headers, body });
      if (res.ok) return await res.json();
      const text = await res.text().catch(() => '');
      // 4xx (exceto 429) não adianta repetir
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        throw new FetchError(`HTTP ${res.status} em ${url}`, res.status, text);
      }
      lastErr = new FetchError(`HTTP ${res.status} em ${url}`, res.status, text);
    } catch (err) {
      if (err instanceof FetchError && err.status >= 400 && err.status < 500 && err.status !== 429) throw err;
      lastErr = err;
    }
    if (attempt < retries) await sleep(1000 * 2 ** attempt);
  }
  throw lastErr;
}

export async function fetchText(url, { headers = {}, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) return await res.text();
      lastErr = new FetchError(`HTTP ${res.status} em ${url}`, res.status);
      if (res.status >= 400 && res.status < 500 && res.status !== 429) throw lastErr;
    } catch (err) {
      if (err instanceof FetchError && err.status >= 400 && err.status < 500 && err.status !== 429) throw err;
      lastErr = err;
    }
    if (attempt < retries) await sleep(1000 * 2 ** attempt);
  }
  throw lastErr;
}

export function formatBRL(n) {
  if (n == null || Number.isNaN(n)) return 'n/d';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function progress(msg) {
  process.stderr.write(`\x1b[36m›\x1b[0m ${msg}\n`);
}

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
