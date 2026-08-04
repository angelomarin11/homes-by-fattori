/**
 * Modo prospecção (aluguel para certificadora): consolida os scans de vários
 * vendedores num ranking de leads — quem tem mais itens críticos e mais
 * faturamento em risco é o melhor prospect para o serviço de certificação.
 * Saída: leads.html (visão comercial) + leads.csv (importável em CRM).
 */
import { escapeHtml as esc, formatBRL } from './util.js';
import { DEFAULT_BRAND } from './brand.js';

export function summarizeScan({ seller, items, reportFile }) {
  const by = (s) => items.filter((i) => i.status === s);
  const criticos = by('critico');
  const atencao = by('atencao');
  const sum = (list) => list.reduce((acc, i) => acc + (i.revenue?.monthlyRevenue ?? 0), 0);
  // Qualificação: quem paga homologação é fabricante/importador com marca —
  // crítico de marca identificável vale muito mais que revendedor de genérico
  // (que tende a trocar de fornecedor em vez de certificar).
  const qualificados = criticos.filter((i) => i.leadProfile?.perfil === 'marca-identificavel');
  const topCritico = [...(qualificados.length ? qualificados : criticos)].sort(
    (a, b) => (b.revenue?.monthlyRevenue ?? 0) - (a.revenue?.monthlyRevenue ?? 0)
  )[0];
  return {
    nickname: seller.nickname,
    permalink: seller.permalink ?? '',
    totalItens: items.length,
    criticos: criticos.length,
    criticosQualificados: qualificados.length,
    atencao: atencao.length,
    ok: by('ok').length,
    riscoMensal: sum(criticos),
    riscoQualificado: sum(qualificados),
    exposicaoAtencao: sum(atencao),
    topCritico: topCritico ? topCritico.title : '',
    marcas: [...new Set(qualificados.map((i) => i.leadProfile?.marca).filter(Boolean))].slice(0, 3),
    reportFile,
  };
}

/**
 * Score de priorização comercial: críticos QUALIFICADOS (marca identificável)
 * dominam — são os únicos com propensão real a contratar homologação.
 */
export function leadScore(l) {
  return (
    (l.riscoQualificado ?? 0) * 2 +
    (l.criticosQualificados ?? 0) * 3000 +
    l.riscoMensal * 0.3 +
    l.criticos * 200
  );
}

export function renderLeadsCsv(leads) {
  const header = [
    'nickname', 'permalink', 'total_itens', 'criticos', 'criticos_marca_identificavel',
    'marcas_detectadas', 'atencao', 'ok',
    'faturamento_risco_mensal_brl', 'risco_qualificado_mensal_brl',
    'exposicao_atencao_mensal_brl', 'top_item_critico', 'relatorio',
  ];
  const cell = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const rows = leads.map((l) =>
    [
      l.nickname, l.permalink, l.totalItens, l.criticos, l.criticosQualificados ?? 0,
      (l.marcas ?? []).join(', '), l.atencao, l.ok,
      l.riscoMensal.toFixed(2), (l.riscoQualificado ?? 0).toFixed(2),
      l.exposicaoAtencao.toFixed(2), l.topCritico, l.reportFile,
    ].map(cell).join(';')
  );
  return '﻿' + [header.join(';'), ...rows].join('\n');
}

export function renderLeadsHtml(leads, { brand = DEFAULT_BRAND, scannedAt = Date.now(), errors = [] } = {}) {
  const sorted = [...leads].sort((a, b) => leadScore(b) - leadScore(a));
  const totalRisco = sorted.reduce((s, l) => s + l.riscoMensal, 0);
  const totalCriticos = sorted.reduce((s, l) => s + l.criticos, 0);
  const totalQualificados = sorted.reduce((s, l) => s + (l.criticosQualificados ?? 0), 0);
  const dataScan = new Date(scannedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const fmtRange = (v) => (v ? `${formatBRL(Math.round((v * 0.6) / 100) * 100)}–${formatBRL(Math.round((v * 1.4) / 100) * 100)}` : 'n/d');
  const row = (l, i) => `
  <tr>
    <td class="num">${i + 1}</td>
    <td><strong>${esc(l.nickname)}</strong>${l.permalink ? ` <a class="small" href="${esc(l.permalink)}" target="_blank" rel="noopener">loja ↗</a>` : ''}
      ${l.topCritico ? `<div class="muted small">maior dor: ${esc(l.topCritico)}</div>` : ''}
      ${l.marcas?.length ? `<div class="muted small">marcas: ${esc(l.marcas.join(', '))}</div>` : ''}</td>
    <td class="num qual">${l.criticosQualificados ?? 0}</td>
    <td class="num crit">${l.criticos}</td>
    <td class="num warn">${l.atencao}</td>
    <td class="num"><strong>${fmtRange(l.riscoMensal)}</strong><span class="muted">/mês</span></td>
    <td>${l.reportFile ? `<a href="${esc(l.reportFile)}">abrir ↗</a>` : '—'}</td>
  </tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(brand.nome)} — Ranking de prospecção</title>
<style>
  :root { --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --brand:${esc(brand.corPrimaria)}; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#f8fafc; }
  .page { max-width: 1000px; margin: 0 auto; padding: 32px 24px 64px; }
  header { background: var(--brand); color:#fff; border-radius: 12px; padding: 30px 34px; margin-bottom: 22px; }
  header h1 { margin: 8px 0 4px; font-size: 24px; }
  header .sub { opacity:.85; font-size: 14px; }
  .logo { font-weight:700; letter-spacing:.4px; font-size:13px; text-transform:uppercase; opacity:.9; }
  .kpis { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0; }
  .kpi { background:#fff; border:1px solid var(--line); border-radius:10px; padding:16px 18px; }
  .kpi .n { font-size: 26px; font-weight: 700; }
  .kpi .l { color: var(--muted); font-size: 13px; }
  table { width:100%; border-collapse: collapse; background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; font-size:14px; }
  th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.4px; color:var(--muted); padding:10px 12px; background:#f1f5f9; }
  td { padding: 10px 12px; border-top:1px solid var(--line); vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; }
  td.crit { color:#b91c1c; font-weight:700; }
  td.qual { color:#166534; font-weight:700; }
  td.warn { color:#a16207; }
  a { color: var(--brand); text-decoration:none; }
  .muted { color: var(--muted); }
  .small { font-size: 12px; }
  .note { color: var(--muted); font-size: 12px; margin-top: 18px; line-height:1.6; }
</style>
</head>
<body>
<div class="page">
  <header>
    <div class="logo">${esc(brand.nome)}</div>
    <h1>Ranking de prospecção — compliance ANATEL/INMETRO</h1>
    <div class="sub">${leads.length} loja(s) analisada(s) em ${dataScan} · ordenado por propensão (críticos com marca identificável primeiro)</div>
  </header>

  <div class="kpis">
    <div class="kpi"><div class="n" style="color:#166534">${totalQualificados}</div><div class="l">críticos com marca identificável — os leads com propensão real a certificar</div></div>
    <div class="kpi"><div class="n" style="color:#b91c1c">${totalCriticos}</div><div class="l">anúncios críticos no total (inclui revendedores de genéricos)</div></div>
    <div class="kpi"><div class="n" style="font-size:20px">${leads.length ? `${formatBRL(Math.round((totalRisco * 0.6) / 100) * 100)} – ${formatBRL(Math.round((totalRisco * 1.4) / 100) * 100)}` : 'n/d'}</div><div class="l">faturamento mensal em risco somado (faixa estimada)</div></div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Loja</th><th>🔴 c/ marca</th><th>🔴 total</th><th>🟡</th><th>Risco mensal (faixa)</th><th>Relatório</th></tr></thead>
    <tbody>${sorted.map(row).join('')}</tbody>
  </table>

  ${errors.length ? `<p class="note">⚠ Falhas de coleta: ${errors.map((e) => esc(e)).join(' · ')}</p>` : ''}

  <p class="note">
    <strong>Como ler:</strong> priorize os críticos <em>com marca identificável</em> — quem certifica é fabricante/importador com
    marca; revendedor de produto genérico tende a trocar de fornecedor, não a certificar. "Marca identificável" é um
    filtro automático de propensão (proxy pelo atributo de marca do anúncio) — a qualificação final é humana.<br>
    Valores de risco são estimativa em faixa: as vendas expostas pela API do ML são referenciais e a média é vitalícia.<br>
    Relatório informativo baseado em dados públicos. Não constitui parecer jurídico. Análise automatizada sujeita a
    falsos positivos — validar antes de abordar o lead.
  </p>
</div>
</body>
</html>`;
}
