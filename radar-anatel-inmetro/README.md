# Radar Conformidade — Scanner ANATEL/INMETRO (MVP)

Analisa o catálogo de um vendedor do Mercado Livre e gera um relatório de risco
de compliance: produtos que exigem **homologação ANATEL** (RF/telecom, Res.
780/2025) ou **certificação INMETRO**, com semáforo 🔴/🟡/🟢 e **faturamento
mensal em risco**.

> MVP de validação. Sem banco de dados, sem login, sem dashboard — um CLI que
> gera um relatório HTML (imprimível em PDF) bom o suficiente para vender.

## Uso

```bash
npm install
cp .env.example .env          # preencha as chaves (ver abaixo)

# Scan real — catálogo do próprio vendedor autenticado (rota recomendada)
node scan.js --seller me --out relatorio.html

# Scan por nickname (depende da busca pública do ML, hoje restrita)
node scan.js --seller "nickname_da_loja" --out relatorio.html

# Demonstração offline (fixtures, sem rede) + teste de regressão
npm run demo
npm test
```

Flags: `--max-items N` limita o scan; `--no-llm` desliga a Camada B; `--mock`
usa os dados de exemplo.

O HTML abre em qualquer navegador; `Ctrl/Cmd+P → salvar como PDF` gera o
entregável final.

## Chaves (.env)

| Variável | Obrigatória? | Para quê |
|---|---|---|
| `ANTHROPIC_API_KEY` | Não | Camada B: classifica itens ambíguos com `claude-haiku-4-5` (lotes de 20). Sem ela, ambíguos ficam 🟡. |
| `ML_ACCESS_TOKEN` | Recomendada | O ML restringiu a busca pública (`/sites/MLB/search`) para a maioria das aplicações desde 2024/2025 — 403 mesmo com token. A rota confiável é o token do **próprio vendedor** (aplicação autorizada pela conta da loja em developers.mercadolivre.com.br) + `--seller me`: usa `/users/me` → `/users/{id}/items/search` (modo scan, sem limite de 1000) → multiget. |
| `ML_CLIENT_ID`+`ML_CLIENT_SECRET` | Não | Token de aplicação (client_credentials) — tentado como fallback na busca pública. |
| `ANATEL_CSV_URL` | Não | Sobrescreve a fonte da base de homologação. Aceita URL http(s) **ou caminho local** de `.csv`/`.zip` (os portais gov.br bloqueiam clientes automatizados com frequência; baixar 1× no navegador e apontar aqui resolve). O dataset oficial é "Produtos de Telecomunicações Homologados pela Anatel" em dados.gov.br. |

## Arquitetura (1 tela)

```
scan.js                     CLI + orquestração
src/ml.js                   API Mercado Livre (busca, paginação, multiget,
                            descrição, categorias; fallback OAuth; modo mock)
src/rules.js                Camada A — regras determinísticas (categoria+título)
src/llm.js                  Camada B — claude-haiku p/ ambíguos (JSON Schema)
src/anatel.js               Código de homologação: regex + atributos do ML +
                            base pública ANATEL (CSV dados abertos, cache 7d)
src/triage.js               Semáforo final + estimativa de faturamento
src/report.js               Relatório HTML (o produto de R$97)
fixtures/                   Catálogo sintético p/ demo/testes offline
cache/                      JSONs de scan + CSV da ANATEL (gitignored)
```

**Stack: Node.js** (uma linguagem só para CLI + futura landing Next.js; o CSV
da ANATEL é parseado com um leitor próprio tolerante a `;`/`,`).

## Postura anti-falso-positivo

- 🔴 só quando título **e** categoria confirmam produto de RF com alta
  convicção (ou LLM ≥ 0,9) **e** não há código de homologação no anúncio.
- Qualquer dúvida (classificação incerta, código não localizado na base,
  base indisponível) → 🟡, nunca 🔴.
- INMETRO nunca vira 🔴 (não há base pública consultável em lote) — sempre 🟡
  com orientação de verificação manual.
- Acessórios passivos (capa, película, cabo, suporte…) são reconhecidos e não
  contaminam ("compatível com iPhone" não é evidência de RF).

## Custos e limites

- LLM: só os itens que as regras não decidem; lotes de 20; Haiku 4.5.
  Catálogo de 500 itens ⇒ tipicamente < US$ 0,10.
- API ML: busca pública pagina até ~1000 anúncios; acima disso o relatório
  marca que analisou uma amostra.
- Base ANATEL: baixada 1× e cacheada por 7 dias.

## O que NÃO está aqui (de propósito)

Contas/login, painel admin, outros marketplaces, orientação de evasão de
fiscalização (o relatório só aponta o caminho de regularização via OCD).
