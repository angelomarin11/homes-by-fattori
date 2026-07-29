#!/usr/bin/env node
/**
 * Radar Conformidade — scanner ANATEL/INMETRO para catálogos do Mercado Livre.
 *
 * Uso:
 *   node scan.js --seller "nickname_da_loja" --out relatorio.html
 *   node scan.js --mock --out relatorio-demo.html     (fixtures locais, sem rede)
 *
 * Flags:
 *   --seller <nick|id>   nickname ou seller_id do ML
 *   --out <arquivo>      caminho do HTML de saída (padrão: relatorio.html)
 *   --max-items <n>      limita a quantidade de itens analisados
 *   --no-llm             desliga a Camada B mesmo com ANTHROPIC_API_KEY
 *   --mock               usa fixtures locais (demonstração/teste offline)
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadEnv, progress, formatBRL, writeCache } from './src/util.js';
import { realClient, mockClient } from './src/ml.js';
import { classifyByRules } from './src/rules.js';
import { classifyWithLLM } from './src/llm.js';
import { loadAnatelBase, findHomologationCode } from './src/anatel.js';
import { resolveClassification, decideStatus, estimateMonthlyRevenue } from './src/triage.js';
import { renderReport } from './src/report.js';

function parseArgs(argv) {
  const args = { out: 'relatorio.html', maxItems: Infinity, llm: true, mock: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--seller') args.seller = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--max-items') args.maxItems = Number(argv[++i]);
    else if (a === '--no-llm') args.llm = false;
    else if (a === '--mock') args.mock = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else {
      console.error(`Flag desconhecida: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv);

  if (args.help || (!args.seller && !args.mock)) {
    console.log('Uso: node scan.js --seller "nickname_da_loja" [--out relatorio.html] [--max-items N] [--no-llm]');
    console.log('     node scan.js --mock  (demonstração offline com dados de exemplo)');
    process.exit(args.help ? 0 : 2);
  }

  const t0 = Date.now();
  const ml = args.mock ? mockClient() : realClient();

  // ── Etapa 1: coleta ──────────────────────────────────────────────────────
  progress(args.mock ? 'Modo MOCK: usando fixtures locais.' : `Buscando loja "${args.seller}"…`);
  const seller = await ml.resolveSeller(args.seller ?? 'mock');
  progress(`Loja: ${seller.nickname} (id ${seller.id})${seller.total != null ? ` — ${seller.total} anúncios ativos` : ''}`);

  const { items, truncated } = await ml.fetchAllItems(seller.id, {
    maxItems: args.maxItems,
    onPage: (n, total) => progress(`  coletados ${n}${total ? `/${Math.min(total, args.maxItems)}` : ''} anúncios…`),
  });
  if (!items.length) throw new Error('Nenhum anúncio ativo encontrado.');
  progress(`Coleta concluída: ${items.length} anúncios.`);

  // Detalhes (start_time p/ estimativa mensal + atributos completos)
  progress('Buscando detalhes dos anúncios (lotes de 20)…');
  const details = await ml.fetchItemDetails(items.map((i) => i.id), {
    onBatch: (b, total) => progress(`  detalhes ${b}/${total}`),
  });

  // ── Etapa 2A: regras ─────────────────────────────────────────────────────
  progress('Classificando (Camada A — regras)…');
  for (const it of items) {
    it.categoryPath = await ml.fetchCategoryPath(it.category_id);
    it.rule = classifyByRules(it, it.categoryPath);
  }
  const uncertain = items.filter((i) => i.rule.regulado === 'incerto');
  progress(`  regras: ${items.length - uncertain.length} decididos, ${uncertain.length} incertos.`);

  // ── Etapa 2B: LLM para os incertos ───────────────────────────────────────
  let llmResults = new Map();
  if (args.llm && uncertain.length) {
    progress(`Classificando incertos (Camada B — LLM, lotes de 20)…`);
    llmResults = await classifyWithLLM(uncertain, {
      onBatch: (b, total) => progress(`  LLM ${b}/${total}`),
    });
  }

  // ── Etapa 3: código de homologação + base ANATEL ─────────────────────────
  progress('Carregando base de produtos homologados ANATEL…');
  const base = await loadAnatelBase({ mock: args.mock });
  progress(base.disponivel ? `  base ok (${base.codes.size} códigos, origem: ${base.origem})` : '  base indisponível — itens com código ficarão 🟡.');

  progress('Procurando códigos de homologação nos anúncios…');
  for (const it of items) {
    it.cls = resolveClassification(it.rule, llmResults.get(it.id));
    const needsCode = ['anatel', 'ambos'].includes(it.cls.regulado) || it.cls.regulado === 'incerto';
    let description = '';
    if (needsCode) {
      const detail = details.get(it.id);
      const inAttrs = findHomologationCode(it, detail, '');
      if (!inAttrs) description = await ml.fetchDescription(it.id);
      it.codeInfo = inAttrs ?? findHomologationCode(it, detail, description);
    } else {
      it.codeInfo = null;
    }
    Object.assign(it, decideStatus(it.cls, it.codeInfo, base));
    it.revenue = estimateMonthlyRevenue(it, details.get(it.id));
  }

  // ── Etapa 4: relatório ───────────────────────────────────────────────────
  const meta = {
    scannedAt: Date.now(),
    truncated,
    llmUsed: llmResults.size > 0,
  };
  const html = renderReport({ seller, items, base, meta });
  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);

  // cache do scan em JSON (sem banco de dados)
  writeCache(
    `scan-${seller.nickname.replace(/[^a-z0-9_-]/gi, '_')}.json`,
    JSON.stringify({ seller, meta, items }, null, 1)
  );

  // ── Resumo no terminal ───────────────────────────────────────────────────
  const count = (s) => items.filter((i) => i.status === s).length;
  const risco = items
    .filter((i) => i.status === 'critico')
    .reduce((s, i) => s + (i.revenue?.monthlyRevenue ?? 0), 0);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('\n══════════════════════════════════════════════');
  console.log(`  Radar Conformidade — ${seller.nickname}`);
  console.log('══════════════════════════════════════════════');
  console.log(`  Anúncios analisados : ${items.length}`);
  console.log(`  🔴 Críticos          : ${count('critico')}`);
  console.log(`  🟡 Atenção           : ${count('atencao')}`);
  console.log(`  🟢 OK                : ${count('ok')}`);
  console.log(`  Faturamento em risco: ${formatBRL(risco)}/mês`);
  console.log(`  Tempo de scan       : ${secs}s`);
  console.log(`\n  Relatório: ${outPath}`);
  console.log('  (abra no navegador; Ctrl/Cmd+P para exportar em PDF)\n');
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  process.exit(1);
});
