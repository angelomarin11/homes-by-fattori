/**
 * Teste de regressão do pipeline completo em modo mock.
 * Roda o scan sobre as fixtures e confere o semáforo esperado de cada item.
 *   node test.js
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './src/util.js';

const EXPECTED = {
  MLB0000000001: 'critico', // fone TWS bluetooth sem código
  MLB0000000002: 'ok',      // roteador com código válido na base
  MLB0000000003: 'atencao', // smartwatch com código não localizado na base
  MLB0000000004: 'critico', // caixa de som bluetooth sem código
  MLB0000000005: 'atencao', // carregador USB → INMETRO (nunca crítico)
  MLB0000000006: 'ok',      // capinha = acessório passivo
  MLB0000000007: 'ok',      // caneca = não regulado
  MLB0000000008: 'critico', // drone wi-fi sem código
  MLB0000000009: 'critico', // mouse sem fio 2.4GHz sem código
  MLB0000000010: 'atencao', // boneca → INMETRO
  MLB0000000011: 'ok',      // cabo USB = acessório passivo
  MLB0000000012: 'atencao', // panela elétrica → INMETRO
  MLB0000000013: 'ok',      // lâmpada wifi com código válido
  MLB0000000014: 'critico', // rastreador GPS/GSM sem código
  MLB0000000015: 'ok',      // suporte veicular = acessório passivo
  MLB0000000016: 'atencao', // fone com fio em categoria regulada → confirmar
  MLB0000000017: 'critico', // repetidor wi-fi sem código
};

execFileSync('node', ['scan.js', '--mock', '--no-llm', '--out', 'cache/relatorio-test.html'], {
  cwd: ROOT,
  stdio: 'ignore',
});

// lote white-label (modo certificadora)
fs.mkdirSync(path.join(ROOT, 'cache'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'cache', 'lojas-test.txt'), 'TECHSOM.ELETRONICOS\n');
execFileSync(
  'node',
  ['scan.js', '--mock', '--no-llm', '--sellers', 'cache/lojas-test.txt',
   '--brand', 'fixtures/brand-demo.json', '--out-dir', 'cache/relatorios-test'],
  { cwd: ROOT, stdio: 'ignore' }
);

const scan = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'cache', 'scan-TECHSOM_ELETRONICOS.json'), 'utf8')
);

let failures = 0;
for (const it of scan.items) {
  const want = EXPECTED[it.id];
  if (want && it.status !== want) {
    failures++;
    console.error(`✖ ${it.id} esperado=${want} obtido=${it.status} — ${it.title}`);
  }
}
const html = fs.readFileSync(path.join(ROOT, 'cache', 'relatorio-test.html'), 'utf8');
for (const needle of ['Radar Conformidade', 'Faturamento mensal em risco', 'Não constitui parecer jurídico']) {
  if (!html.includes(needle)) {
    failures++;
    console.error(`✖ relatório não contém: "${needle}"`);
  }
}

// white-label: marca, cor, contato e powered-by no relatório; ranking + csv no lote
const branded = fs.readFileSync(path.join(ROOT, 'cache', 'relatorios-test', 'TECHSOM_ELETRONICOS.html'), 'utf8');
for (const needle of ['CertifiQA Certificações', '#134e4a', 'comercial@certifiqa.com.br', 'tecnologia Radar Conformidade']) {
  if (!branded.includes(needle)) {
    failures++;
    console.error(`✖ relatório white-label não contém: "${needle}"`);
  }
}
const leadsHtml = fs.readFileSync(path.join(ROOT, 'cache', 'relatorios-test', 'leads.html'), 'utf8');
const leadsCsv = fs.readFileSync(path.join(ROOT, 'cache', 'relatorios-test', 'leads.csv'), 'utf8');
for (const [name, doc, needle] of [
  ['leads.html', leadsHtml, 'Ranking de prospecção'],
  ['leads.html', leadsHtml, 'TECHSOM.ELETRONICOS'],
  ['leads.csv', leadsCsv, 'faturamento_risco_mensal_brl'],
]) {
  if (!doc.includes(needle)) {
    failures++;
    console.error(`✖ ${name} não contém: "${needle}"`);
  }
}

if (failures) {
  console.error(`\n${failures} falha(s).`);
  process.exit(1);
}
console.log(`✔ ${scan.items.length} itens com semáforo esperado + relatório íntegro.`);
