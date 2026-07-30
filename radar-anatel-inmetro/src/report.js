/**
 * Etapa 4 — relatório HTML (imprimível em PDF pelo navegador).
 * Visual sóbrio e profissional; logo placeholder "Radar Conformidade".
 */
import { escapeHtml as esc, formatBRL } from './util.js';
import { formatCode } from './anatel.js';
import { DEFAULT_BRAND, contactLine } from './brand.js';

const STATUS_META = {
  critico: { label: 'CRÍTICO', emoji: '🔴', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  atencao: { label: 'ATENÇÃO', emoji: '🟡', color: '#a16207', bg: '#fefce8', border: '#fde68a' },
  ok: { label: 'OK', emoji: '🟢', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
};

const REG_LABEL = { anatel: 'ANATEL', inmetro: 'INMETRO', ambos: 'ANATEL + INMETRO', nao: '—', incerto: 'Incerta' };

function fmtMonthly(r) {
  if (r?.monthlyRevenue == null) return 'n/d';
  return `${formatBRL(r.monthlyRevenue)}/mês`;
}

function itemRow(it) {
  const m = STATUS_META[it.status];
  return `
  <tr>
    <td><span class="pill" style="color:${m.color};background:${m.bg};border-color:${m.border}">${m.emoji} ${m.label}</span></td>
    <td>
      <a href="${esc(it.permalink ?? '#')}" target="_blank" rel="noopener">${esc(it.title)}</a>
      <div class="muted small">${esc(it.categoryPath?.join(' › ') || it.category_id || '')}</div>
    </td>
    <td class="num">${it.price != null ? formatBRL(it.price) : 'n/d'}</td>
    <td class="num">${it.sold_quantity ?? 'n/d'}</td>
    <td class="num">${fmtMonthly(it.revenue)}</td>
    <td>${esc(REG_LABEL[it.cls.regulado] ?? '—')}</td>
    <td>${it.codeInfo ? `<code>${formatCode(it.codeInfo.code)}</code>` : '<span class="muted">ausente</span>'}</td>
  </tr>`;
}

function itemCard(it, brand) {
  const m = STATUS_META[it.status];
  return `
  <div class="card" style="border-left:4px solid ${m.color}">
    <div class="card-head">
      <span class="pill" style="color:${m.color};background:${m.bg};border-color:${m.border}">${m.emoji} ${m.label}</span>
      <a href="${esc(it.permalink ?? '#')}" target="_blank" rel="noopener"><strong>${esc(it.title)}</strong></a>
    </div>
    <div class="card-grid">
      <div><span class="muted">Preço</span><br>${it.price != null ? formatBRL(it.price) : 'n/d'}</div>
      <div><span class="muted">Vendas (total)</span><br>${it.sold_quantity ?? 'n/d'}</div>
      <div><span class="muted">Faturamento estimado</span><br>${fmtMonthly(it.revenue)}</div>
      <div><span class="muted">Regulação</span><br>${esc(REG_LABEL[it.cls.regulado] ?? '—')}</div>
    </div>
    <p class="motivo">${esc(it.statusMotivo)}</p>
    ${it.status === 'critico' ? regularizacaoHtml(brand) : ''}
  </div>`;
}

function regularizacaoHtml(brand) {
  const branded = brand?.cta && brand.nome !== DEFAULT_BRAND.nome;
  return `
    <details class="howto">
      <summary>Caminho de regularização</summary>
      <ol>
        <li><strong>Confirme a situação do produto:</strong> consulte o fabricante/importador — muitos produtos já possuem homologação; nesse caso basta <em>exibir o código no anúncio</em> (campo "Número de homologação Anatel" na ficha técnica do Mercado Livre).</li>
        <li><strong>Produto sem homologação:</strong> a homologação é solicitada à ANATEL via sistema Mosaico, com ensaios realizados por um <strong>OCD</strong> (Organismo de Certificação Designado) e laboratório acreditado. Quem homologa normalmente é o fabricante ou o importador.</li>
        <li><strong>Prazo e custo típicos:</strong> variam com o tipo de produto e a documentação disponível — em geral algumas semanas a poucos meses, e de alguns milhares a dezenas de milhares de reais em ensaios/certificação. Peça orçamento a 2–3 OCDs.</li>
        <li><strong>Enquanto isso:</strong> avalie pausar o anúncio ou substituir o fornecedor por um com produto já homologado — a remoção pela plataforma ou a autuação tende a custar mais que a pausa voluntária.</li>
      </ol>
      ${branded ? `<p class="cta-inline"><strong>${esc(brand.nome)}:</strong> ${esc(brand.cta)} ${contactLine(brand) ? `<span class="muted">(${esc(contactLine(brand))})</span>` : ''}</p>` : ''}
    </details>`;
}

export function renderReport({ seller, items, base, meta, brand = DEFAULT_BRAND }) {
  const branded = brand.nome !== DEFAULT_BRAND.nome;
  const criticos = items.filter((i) => i.status === 'critico');
  const atencao = items.filter((i) => i.status === 'atencao');
  const ok = items.filter((i) => i.status === 'ok');

  const sumMonthly = (list) => list.reduce((s, i) => s + (i.revenue?.monthlyRevenue ?? 0), 0);
  const riscoCritico = sumMonthly(criticos);
  const riscoAtencao = sumMonthly(atencao);
  const semEstimativa = [...criticos, ...atencao].filter((i) => i.revenue?.monthlyRevenue == null).length;

  const dt = new Date(meta.scannedAt);
  const dataScan = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(brand.nome)} — ${esc(seller.nickname)}</title>
<style>
  :root { --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --brand:${esc(brand.corPrimaria)}; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color:var(--ink); background:#f8fafc; }
  .page { max-width: 900px; margin: 0 auto; padding: 32px 24px 64px; }
  header.capa { background: var(--brand); color:#fff; border-radius: 12px; padding: 40px 36px; margin-bottom: 28px; }
  .logo { display:flex; align-items:center; gap:10px; font-weight:700; letter-spacing:.4px; font-size:15px; text-transform:uppercase; opacity:.9; }
  .logo .dot { width:12px; height:12px; border-radius:50%; background:#4ade80; box-shadow:0 0 0 4px rgba(74,222,128,.25); }
  header.capa h1 { margin: 18px 0 6px; font-size: 30px; }
  header.capa .sub { opacity:.85; font-size: 15px; }
  .kpis { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0; }
  .kpi { background:#fff; border:1px solid var(--line); border-radius:10px; padding:18px 20px; }
  .kpi .n { font-size: 28px; font-weight: 700; }
  .kpi .l { color: var(--muted); font-size: 13px; margin-top:2px; }
  .risco { background:#7f1d1d; color:#fff; border-radius:12px; padding:26px 30px; margin: 8px 0 28px; }
  .risco .valor { font-size: 40px; font-weight: 800; letter-spacing:-1px; }
  .risco .desc { opacity:.85; margin-top:6px; font-size:14px; max-width: 640px; }
  h2 { font-size: 19px; margin: 34px 0 12px; border-bottom: 2px solid var(--line); padding-bottom: 8px; }
  table { width:100%; border-collapse: collapse; background:#fff; border:1px solid var(--line); border-radius:10px; overflow:hidden; font-size:14px; }
  th { text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.4px; color:var(--muted); padding:10px 12px; background:#f1f5f9; }
  td { padding: 10px 12px; border-top:1px solid var(--line); vertical-align: top; }
  td.num { text-align: right; white-space: nowrap; }
  a { color: var(--brand); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .pill { display:inline-block; border:1px solid; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight:600; white-space:nowrap; }
  .muted { color: var(--muted); }
  .small { font-size: 12px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:10px; padding: 16px 18px; margin: 12px 0; }
  .card-head { display:flex; gap:12px; align-items:baseline; margin-bottom:10px; flex-wrap:wrap; }
  .card-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; font-size:14px; margin-bottom: 8px; }
  .motivo { font-size: 14px; margin: 8px 0 0; }
  .howto { margin-top: 12px; font-size: 14px; background:#f8fafc; border:1px solid var(--line); border-radius:8px; padding: 10px 14px; }
  .howto summary { cursor:pointer; font-weight:600; }
  .cta-inline { border-top:1px solid var(--line); margin-top:10px; padding-top:10px; }
  .cta-box { background: var(--brand); color:#fff; border-radius: 12px; padding: 20px 26px; margin: 0 0 8px; }
  .cta-box .cta-title { font-size:13px; text-transform:uppercase; letter-spacing:.6px; opacity:.8; margin-bottom:6px; }
  .cta-box p { margin: 4px 0; font-size: 15px; }
  .cta-box .cta-contact { font-weight: 700; margin-top: 8px; }
  .howto ol { margin: 10px 0 4px; padding-left: 20px; }
  .howto li { margin: 6px 0; }
  footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; line-height: 1.6; }
  .metodo { font-size: 13px; color: var(--muted); background:#fff; border:1px solid var(--line); border-radius:10px; padding: 14px 18px; }
  code { background:#f1f5f9; padding: 1px 6px; border-radius:5px; font-size: 13px; }
  @media print {
    body { background:#fff; }
    .page { max-width:none; padding: 0; }
    .howto { page-break-inside: avoid; }
    .card { page-break-inside: avoid; }
    a { color: inherit; }
  }
  @media (max-width: 640px) {
    .kpis, .card-grid { grid-template-columns: repeat(2, 1fr); }
    table { display:block; overflow-x:auto; }
  }
</style>
</head>
<body>
<div class="page">

  <header class="capa">
    <div class="logo"><span class="dot"></span> ${esc(brand.nome)}</div>
    <h1>Relatório de Conformidade ANATEL / INMETRO</h1>
    <div class="sub">
      Loja: <strong>${esc(seller.nickname)}</strong>
      ${seller.permalink ? ` · <a style="color:#cbd5e1" href="${esc(seller.permalink)}">${esc(seller.permalink)}</a>` : ''}<br>
      Scan realizado em ${dataScan} · ${items.length} anúncios analisados${meta.truncated ? ' (amostra: a busca pública limita a paginação)' : ''}
    </div>
  </header>

  <div class="kpis">
    <div class="kpi"><div class="n" style="color:#b91c1c">🔴 ${criticos.length}</div><div class="l">Críticos — produto regulado sem código de homologação válido</div></div>
    <div class="kpi"><div class="n" style="color:#a16207">🟡 ${atencao.length}</div><div class="l">Atenção — verificação recomendada</div></div>
    <div class="kpi"><div class="n" style="color:#15803d">🟢 ${ok.length}</div><div class="l">OK — sem pendência identificada</div></div>
  </div>

  <div class="risco">
    <div style="font-size:13px; text-transform:uppercase; letter-spacing:.6px; opacity:.8">Faturamento mensal em risco (anúncios críticos)</div>
    <div class="valor">${formatBRL(riscoCritico)}</div>
    <div class="desc">
      Estimativa: preço × vendas mensais médias dos anúncios 🔴 — o faturamento que deixaria de existir se esses anúncios forem removidos pela plataforma ou pela fiscalização.
      ${riscoAtencao > 0 ? `Anúncios 🟡 somam exposição adicional de <strong>${formatBRL(riscoAtencao)}/mês</strong>.` : ''}
      ${semEstimativa > 0 ? `${semEstimativa} anúncio(s) sem dados de venda suficientes ficaram fora da soma.` : ''}
    </div>
  </div>

  ${branded && brand.cta ? `<div class="cta-box"><div class="cta-title">Como regularizar</div><p>${esc(brand.cta)}</p>${contactLine(brand) ? `<p class="cta-contact">${esc(contactLine(brand))}</p>` : ''}</div>` : ''}

  ${criticos.length ? `<h2>🔴 Críticos (${criticos.length}) — agir agora</h2>${criticos.map((i) => itemCard(i, brand)).join('')}` : '<h2>🔴 Críticos</h2><p class="muted">Nenhum anúncio crítico identificado. 🎉</p>'}

  ${atencao.length ? `<h2>🟡 Atenção (${atencao.length}) — verificar</h2>${atencao.map((i) => itemCard(i, brand)).join('')}` : ''}

  <h2>🟢 OK (${ok.length})</h2>
  ${ok.length ? `<table>
    <thead><tr><th>Status</th><th>Anúncio</th><th>Preço</th><th>Vendas</th><th>Fat. est.</th><th>Regulação</th><th>Cód. homologação</th></tr></thead>
    <tbody>${ok.map(itemRow).join('')}</tbody>
  </table>` : '<p class="muted">Nenhum.</p>'}

  <h2>Metodologia</h2>
  <div class="metodo">
    <p><strong>Base regulatória:</strong> Resolução ANATEL nº 780/2025 — obriga a exibição do código de homologação em anúncios de produtos de telecomunicações/RF e estabelece responsabilidade solidária entre marketplace e vendedor, com remoção de anúncios irregulares. Produtos das categorias INMETRO exigem certificação compulsória.</p>
    <p><strong>Como analisamos:</strong> (1) coleta dos anúncios ativos via API pública do Mercado Livre; (2) classificação por regras de categoria/palavras-chave${meta.llmUsed ? ' e por modelo de linguagem para casos ambíguos' : ''}; (3) busca do código de homologação nos atributos, título e descrição do anúncio; (4) conferência do código na base pública de produtos homologados da ANATEL${base.disponivel ? ` (${esc(base.origem)})` : ' (indisponível nesta execução)'}.</p>
    <p><strong>Semáforo:</strong> 🔴 produto de RF identificado com alta confiança e sem código válido exibido; 🟡 qualquer situação que exija confirmação humana (classificação incerta, código não localizado na base, categoria INMETRO); 🟢 sem pendência identificada. Em caso de dúvida o item é sempre rebaixado para 🟡, nunca promovido a 🔴.</p>
  </div>

  <footer>
    Relatório informativo baseado em dados públicos (API Mercado Livre e base de homologação ANATEL). Não constitui parecer jurídico.
    Análise automatizada sujeita a falsos positivos — recomenda-se validação antes de qualquer decisão.<br>
    ${branded ? `Preparado por ${esc(brand.nome)}${brand.poweredBy ? ' · tecnologia Radar Conformidade' : ''}` : 'Gerado por Radar Conformidade'} em ${dataScan}.
  </footer>

</div>
</body>
</html>`;
}
