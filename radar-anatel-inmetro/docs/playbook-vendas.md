# Playbook de vendas — Radar Conformidade

> Documento interno. Como encontrar, abordar e fechar o primeiro cliente.
> Material de apresentação: `docs/deck-certificadoras.pptx` (notas do
> apresentador em cada slide).
>
> ⚠ **PRÉ-REQUISITO INEGOCIÁVEL:** nenhuma abordagem antes dos 3 gates de
> `docs/decisao-go-nogo.md` fecharem em verde (coleta real, qualidade do
> sinal, demanda declarada). Vender capacidade não demonstrada queima um
> mercado que tem poucas dezenas de compradores — e todos se conhecem.

## 1. Quem é o comprador (ICP)

Em ordem de prioridade:

1. **Consultorias de homologação/certificação regulatória.** Numerosas,
   agressivas comercialmente, sem restrição de imparcialidade, decisão rápida.
   **É o alvo nº 1** — vivem exatamente de originar processos de homologação.
2. **Laboratórios de ensaio** que intermediam certificação.
3. **OCDs — Organismos de Certificação Designados pela ANATEL.** Ticket alto,
   mas **cuidado**: OCDs acreditados operam sob requisito de imparcialidade
   (ISO/IEC 17065) — prospecção ativa apontando "irregularidades" de
   não-clientes pode ser vetada pelo compliance deles. Abordar somente pela
   diretoria comercial, enquadrando o produto como *inteligência de mercado*,
   e aceitar que a taxa de recusa aqui será alta por razão estrutural.

Dentro da empresa, o alvo é **quem sente a meta**: sócio-diretor (nas
pequenas/médias) ou head comercial (nas maiores). Evitar começar pelo técnico —
ele avalia a ferramenta, não a receita.

## 2. Onde encontrar

- Lista oficial de OCDs no site da ANATEL (gov.br) — pública.
- Google/Maps: "homologação ANATEL empresa", "consultoria certificação
  INMETRO" — quem anuncia nessas keywords já paga por lead (comprador ideal).
- LinkedIn: cargos "certificação", "regulatório", "homologação" nas empresas
  acima.
- Quem patrocina/palestra em eventos do setor eletroeletrônico (Eletrolar,
  feiras de importadores).

Meta inicial: **lista de 20 alvos** com nome, empresa, cargo, e-mail/LinkedIn.

## 3. A isca: demo com dados do nicho DELES

Regra de ouro: **nunca pedir reunião para "apresentar uma ferramenta"**.
Antes do primeiro contato, rodar o scan em 3–5 lojas do nicho que aquela
certificadora atende (ex.: se ela certifica áudio/vídeo, escanear lojas de
eletrônicos) e abrir a conversa já com o resultado:

> Assunto: N marcas vendendo produto de RF sem homologação no seu segmento
>
> [Nome], analisei o catálogo de algumas lojas do Mercado Livre no segmento
> que a [Consultoria] atende. Encontrei **N anúncios críticos de marcas
> identificáveis** — fabricantes/importadores que precisam homologar (filtrei
> fora os revendedores de genéricos, que trocam de fornecedor em vez de
> certificar). Faturamento em risco estimado entre R$ X e R$ Y por mês.
>
> Montei o levantamento num relatório de 1 página. Posso te mostrar em 15
> minutos como transformamos isso num canal de vendas para a [Certificadora]?

O anexo é o próprio ranking (`leads.html` impresso em PDF) — a demo se vende
sozinha porque É o produto.

## 4. Cadência de abordagem (por alvo)

| Dia | Ação |
|---|---|
| 0 | E-mail com a isca (acima) + conexão no LinkedIn sem mensagem |
| 3 | Mensagem curta no LinkedIn referenciando o e-mail |
| 7 | Follow-up de e-mail com UM dado novo ("achei mais uma loja com R$ Y em risco") |
| 12 | Ligação/WhatsApp se houver telefone público |
| 20 | Último toque ("fecho o assunto?") — e pausa o alvo por 90 dias |

Nunca mais de um argumento por mensagem. O número em R$ é sempre o gancho.

## 5. A reunião (15–20 min, roteiro)

1. **2 min — pergunta, não pitch:** "como vocês prospectam hoje? quanto custa
   fechar um contrato novo?" (as respostas viram munição para o fechamento).
2. **5 min — deck, slides 2–4:** momento regulatório → dor → pipeline.
3. **5 min — demo ao vivo:** abrir o `leads.html` e um relatório white-label
   **já com a marca deles** (gerar antes da call — 5 min de trabalho, impacto
   enorme: eles se veem no produto).
4. **3 min — piloto e preço** (slides 8–9). Ancorar no valor do contrato de
   homologação, nunca no custo da ferramenta.
5. **Fechamento:** pedir UMA coisa — a lista de 10–20 lojas do nicho deles.
   Quem manda a lista virou piloto.

## 6. Objeções e respostas

| Objeção | Resposta |
|---|---|
| "Já temos comercial/prospecção" | Ótimo — isso não substitui seu comercial, alimenta ele. A pergunta é: sua equipe hoje sabe QUAIS marcas têm produto irregular e QUANTO isso custa para cada uma? |
| "Nosso inbound já traz cliente (o ML avisa o vendedor)" | Verdade — e é por isso que o filtro importa: o inbound traz quem JÁ foi removido; o radar mostra quem é o PRÓXIMO, antes do concorrente de vocês chegar. E qualifica: marca própria, não revendedor. |
| "Somos OCD, não podemos parecer parciais" | O material é diagnóstico informativo com fontes públicas e limites declarados — sem juízo conclusivo. Mas se o compliance vetar, entendemos: este produto serve melhor a consultorias (e podemos conversar sobre a versão inteligência de mercado). |
| "Isso é legal? É scraping?" | Só dados públicos: API oficial do ML e dados abertos da ANATEL. O relatório declara fontes e limites em todo documento — feito para proteger a sua marca. |
| "E se o dado estiver errado / falso positivo?" | O sistema é conservador por desenho: dúvida nunca vira 'crítico'. E o processo prevê validação humana antes da abordagem — item do piloto. |
| "E se o Mercado Livre mudar a API?" | O risco existe e é nosso, não seu: a licença é mensal, sem fidelidade. E o modelo funciona também com colheita assistida das páginas públicas. |
| "Está caro" | Comparado a quê? Um estande em feira custa 10x e não diz quem precisa de você. Um contrato de homologação paga o ano de licença. (Se insistir: trocar desconto por case público + indicações, nunca só baixar preço.) |
| "Deixa eu pensar / falar com o sócio" | Perfeito — me manda 10 lojas do seu nicho enquanto isso, e na próxima conversa vocês decidem olhando leads reais de vocês, não slides meus. |

## 7. Funil e metas (primeiros 60 dias)

```
20 alvos contatados
 → 6–8 respostas (isca com número em R$ responde bem)
 → 4–5 reuniões
 → 2 pilotos de R$ 997
 → 1 assinatura Essencial (R$ 1.997/mês)
```

Sinais para **pivotar a abordagem** se o funil travar: sem resposta ao e-mail
→ trocar nicho das lojas da isca; reunião sem fechar piloto → baixar
fricção (piloto gratuito com sucesso compartilhado: % do 1º contrato).

## 8. Operação do piloto (o que NÓS fazemos)

- Semana 1: brand.json da certificadora + lista de lojas → colheita dos
  catálogos (rota que o `doctor.js` validar) → scans.
- Semana 2: entrega ranking + relatórios; call de revisão dos 5 top leads.
- Semanas 3–4: acompanhar 2 abordagens reais; ajustar texto do relatório com
  o feedback; medir: leads abordados, respostas, propostas, contrato.
- Encerramento: relatório do piloto de 1 página + proposta de assinatura.

## 9. Regras do que NÃO fazer

- Não prometer volume de leads antes do `doctor.js` confirmar a rota de coleta.
- Não abordar lojistas diretamente em nome da certificadora sem autorização
  escrita dela (a marca é dela).
- Não inventar estatísticas de mercado no pitch — os números fortes já são
  reais (faturamento em risco por loja).
- Não vender para duas certificadoras concorrentes no mesmo nicho durante o
  piloto — exclusividade de nicho é argumento de fechamento.
