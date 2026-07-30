#!/usr/bin/env node
/**
 * Radar Conformidade — scanner ANATEL/INMETRO para catálogos do Mercado Livre.
 *
 * Uso:
 *   node scan.js --seller "nickname_da_loja" --out relatorio.html
 *   node scan.js --seller me                          (catálogo do próprio vendedor autenticado)
 *   node scan.js --sellers lojas.txt --out-dir relatorios/   (prospecção em lote p/ certificadora)
 *   node scan.js --mock --out relatorio-demo.html     (fixtures locais, sem rede)
 *
 * Flags:
 *   --seller <nick|id|me>  nickname/seller_id do ML, ou "me" (exige ML_ACCESS_TOKEN)
 *   --sellers <arquivo>    lote: um nickname/id por linha (# comenta); gera ranking de leads
 *   --brand <config.json>  white-label: nome/cor/contato da certificadora nos relatórios
 *   --out <arquivo>        HTML de saída no modo single (padrão: relatorio.html)
 *   --out-dir <pasta>      pasta de saída no modo lote (padrão: relatorios/)
 *   --max-items <n>        limita a quantidade de itens analisados por loja
 *   --no-llm               desliga a Camada B mesmo com ANTHROPIC_API_KEY
 *   --mock                 usa fixtures locais (demonstração/teste offline)
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
import { loadBrand } from './src/brand.js';
import { summarizeScan, renderLeadsHtml, renderLeadsCsv } from './src/leads.js';

function parseArgs(argv) {
  const args = { out: 'relatorio.html', outDir: 'relatorios', maxItems: Infinity, llm: true, mock: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--seller') args.seller = argv[++i];
    else if (a === '--sellers') args.sellersFile = argv[++i];
    else if (a === '--brand') args.brandFile = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--out-dir') args.outDir = argv[++i];
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

/** Pipeline completo para um seller. Retorna { seller, items, base, meta }. */
async function scanSeller(ml, sellerQuery, args, base) {
  progress(`Buscando loja "${sellerQuery}"…`);
  const seller = await ml.resolveSeller(sellerQuery);
  progress(`Loja: ${seller.nickname} (id ${seller.id})${seller.total != null ? ` — ${seller.total} anúncios ativos` : ''}`);

  const { items, truncated } = await ml.fetchAllItems(seller.id, {
    maxItems: args.maxItems,
    own: seller.own === true,
    onPage: (n, total) => progress(`  coletados ${n}${total ? `/${Math.min(total, args.maxItems)}` : ''} anúncios…`),
  });
  if (!items.length) throw new Error(`Nenhum anúncio ativo encontrado para ${seller.nickname}.`);
  progress(`Coleta concluída: ${items.length} anúncios.`);

  progress('Buscando detalhes dos anúncios (lotes de 20)…');
  const details = await ml.fetchItemDetails(items.map((i) => i.id), {
    onBatch: (b, total) => progress(`  detalhes ${b}/${total}`),
  });

  progress('Classificando (Camada A — regras)…');
  for (const it of items) {
    it.categoryPath = await ml.fetchCategoryPath(it.category_id);
    it.rule = classifyByRules(it, it.categoryPath);
  }
  const uncertain = items.filter((i) => i.rule.regulado === 'incerto');
  progress(`  regras: ${items.length - uncertain.length} decididos, ${uncertain.length} incertos.`);

  let llmResults = new Map();
  if (args.llm && uncertain.length) {
    progress('Classificando incertos (Camada B — LLM, lotes de 20)…');
    llmResults = await classifyWithLLM(uncertain, {
      onBatch: (b, total) => progress(`  LLM ${b}/${total}`),
    });
  }

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

  const meta = { scannedAt: Date.now(), truncated, llmUsed: llmResults.size > 0 };
  writeCache(
    `scan-${seller.nickname.replace(/[^a-z0-9_-]/gi, '_')}.json`,
    JSON.stringify({ seller, meta, items }, null, 1)
  );
  return { seller, items, meta };
}

function printSummary({ seller, items }, outPath, t0) {
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

async function main() {
  loadEnv();
  const args = parseArgs(process.argv);

  if (args.help || (!args.seller && !args.sellersFile && !args.mock)) {
    console.log('Uso: node scan.js --seller "nickname" [--brand certificadora.json] [--out relatorio.html]');
    console.log('     node scan.js --sellers lojas.txt [--brand certificadora.json] [--out-dir relatorios/]');
    console.log('     node scan.js --mock  (demonstração offline com dados de exemplo)');
    process.exit(args.help ? 0 : 2);
  }

  const t0 = Date.now();
  const ml = args.mock ? mockClient() : realClient();
  const brand = loadBrand(args.brandFile);

  progress('Carregando base de produtos homologados ANATEL…');
  const base = await loadAnatelBase({ mock: args.mock });
  progress(base.disponivel ? `  base ok (${base.codes.size} códigos, origem: ${base.origem})` : '  base indisponível — itens com código ficarão 🟡.');

  // ── Modo lote (prospecção p/ certificadora) ─────────────────────────────
  if (args.sellersFile) {
    const sellers = fs
      .readFileSync(args.sellersFile, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    if (!sellers.length) throw new Error(`${args.sellersFile}: nenhum seller listado.`);

    fs.mkdirSync(args.outDir, { recursive: true });
    const leads = [];
    const errors = [];
    for (const [i, s] of sellers.entries()) {
      progress(`\n─── Loja ${i + 1}/${sellers.length}: ${s} ───`);
      try {
        const result = await scanSeller(ml, s, args, base);
        const fileName = `${result.seller.nickname.replace(/[^a-z0-9_-]/gi, '_')}.html`;
        fs.writeFileSync(path.join(args.outDir, fileName), renderReport({ ...result, base, brand }));
        leads.push(summarizeScan({ ...result, reportFile: fileName }));
      } catch (err) {
        errors.push(`${s}: ${String(err.message).slice(0, 120)}`);
        progress(`  ✖ falhou: ${err.message}`);
      }
    }
    if (!leads.length) throw new Error('Nenhuma loja pôde ser escaneada.');

    fs.writeFileSync(path.join(args.outDir, 'leads.html'), renderLeadsHtml(leads, { brand, errors }));
    fs.writeFileSync(path.join(args.outDir, 'leads.csv'), renderLeadsCsv(leads));

    const totalCrit = leads.reduce((s, l) => s + l.criticos, 0);
    const totalRisco = leads.reduce((s, l) => s + l.riscoMensal, 0);
    console.log('\n══════════════════════════════════════════════');
    console.log(`  Prospecção — ${leads.length} loja(s), ${errors.length} falha(s)`);
    console.log('══════════════════════════════════════════════');
    console.log(`  🔴 críticos no total : ${totalCrit}`);
    console.log(`  Risco mensal somado : ${formatBRL(totalRisco)}`);
    console.log(`\n  Ranking : ${path.resolve(args.outDir, 'leads.html')}`);
    console.log(`  CSV/CRM : ${path.resolve(args.outDir, 'leads.csv')}`);
    console.log(`  Relatórios individuais em ${path.resolve(args.outDir)}/\n`);
    return;
  }

  // ── Modo single ─────────────────────────────────────────────────────────
  if (args.mock) progress('Modo MOCK: usando fixtures locais.');
  const result = await scanSeller(ml, args.seller ?? 'mock', args, base);
  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, renderReport({ ...result, base, brand }));
  printSummary(result, outPath, t0);
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  process.exit(1);
});
