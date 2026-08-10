# Linha de lançamento — 5 modelos

Estrutura da coleção de estreia: **3 modelos "estilo" (S1–S3)** no playbook
Farr + Swit (módulo genérico, valor no design/narrativa, preço de impulso) +
**2 modelos "jogo" (G1–G2)** com módulo programável próprio (o diferencial
que nenhuma microbrand retrô-digital tem).

Nomes abaixo são **codinomes de trabalho** — a nomenclatura final depende do
nome da marca (ver seção Naming).

## Os 5 modelos

### S1 — "ORLA" (estilo, translúcido)
- Vibe: verão/orla anos 80, caixa translúcida (referência Memorex Clear da
  Farr + Swit, mas com paleta BR: azul-piscina, coral, amarelo-sol).
- Base: SKMEI semi-custom, caixa de resina translúcida, módulo de linha
  (dia/data/alarme/crono, luz).
- Lote: 100 un (mín. p/ logo) · custo landed alvo: R$ 60–90 · **preço: R$ 199**

### S2 — "CONCRETO" (estilo, metal)
- Vibe: brutalismo paulistano, caixa de metal escovado (base tipo SKMEI 1123),
  mostrador cinza-concreto, tipografia técnica.
- Base: SKMEI 1123 semi-custom (metal, luz EL forte).
- Lote: 100 un · custo landed alvo: R$ 80–110 · **preço: R$ 249**

### S3 — "TROPICAL" (estilo, cor)
- Vibe: Memphis/tropicália, resina colorida, pulseira com estampa, edição
  numerada estilo "Vol. 1" (drops de cor a cada estação).
- Base: SKMEI semi-custom resina, 3 combinações de cor no mesmo molde.
- Lote: 100 un (3 cores × ~33) · custo landed alvo: R$ 60–90 · **preço: R$ 219**

### G1 — "TERMO" (jogo: palavra do dia)
- O carro-chefe: **uma palavra por dia, no pulso**. Roda a `termo_face`
  (firmware/ deste repositório) + relógio/alarme/cronômetro normais.
- Base fase 1: caixa SKMEI 1123 ou F-91W + chassi de módulo 593 + **placa
  própria estilo Sensor Watch** (SAM L22, PCBA na JLCPCB).
- Lote: 50 un numeradas · custo landed alvo: R$ 150–250 · **preço: R$ 499**
- Posicionamento: drop limitado, pré-venda, unboxing com cartela-poster
  explicando o jogo.

### G2 — "SEQUENCIA" (jogo: memória sonora)
- Jogo estilo Genius/Simon: o relógio pisca segmentos + bipa em tons
  diferentes, você repete a sequência nos botões. Usa o buzzer que a caixa já
  tem. (Nome "Genius" é marca da Estrela no BR — não usar.)
- Mesma plataforma de hardware do G1 (mesma placa, outra watch face) —
  **um firmware, dois produtos**, só muda caixa/cor/embalagem.
- Lote: 50 un · custo landed alvo: R$ 150–250 · **preço: R$ 449**

## Economia do lançamento (estimativa honesta)

| Modelo | Un | Custo/un | Preço | Receita bruta | Margem bruta |
|---|---|---|---|---|---|
| S1 ORLA | 100 | R$ 75 | R$ 199 | R$ 19.900 | ~R$ 12.400 |
| S2 CONCRETO | 100 | R$ 95 | R$ 249 | R$ 24.900 | ~R$ 15.400 |
| S3 TROPICAL | 100 | R$ 75 | R$ 219 | R$ 21.900 | ~R$ 14.400 |
| G1 TERMO | 50 | R$ 200 | R$ 499 | R$ 24.950 | ~R$ 14.950 |
| G2 SEQUENCIA | 50 | R$ 200 | R$ 449 | R$ 22.450 | ~R$ 12.450 |
| **Total** | **400** | — | — | **R$ 114.100** | **~R$ 69.600** |

Investimento inicial estimado: R$ 35–45 mil (produção + embalagem + INPI +
amostras + tráfego de lançamento). Margem bruta não inclui impostos de venda,
taxas de plataforma e marketing — modelar no Simples antes de fechar preço.

> Números de custo são alvos a validar com cotação real (perguntas 1–4 do
> roteiro SKMEI em PLANO-DA-MARCA.md) e com o custo real do lote de PCBA.

## Sequência de lançamento (drops, não tudo de uma vez)

1. **Drop 0 (pré-lançamento):** conteúdo do protótipo G1 funcionando —
   vídeo "joguei Termo no meu relógio" é o gancho de imprensa/IG/TikTok.
2. **Drop 1:** S1 + S3 (baratos, giram rápido, testam logística).
3. **Drop 2:** G1 TERMO em pré-venda numerada (a fila do drop 1 vira lista).
4. **Drop 3:** S2 + G2 (fecha a coleção; G2 reaproveita a fila do G1).

## Cronograma alvo

| Mês | Entrega |
|---|---|
| M1 | Nome da marca + depósito INPI · protótipo G1 físico funcionando (F-91W + Sensor Watch + termo_face) |
| M2 | Cotações SKMEI (S1–S3, caixas G1/G2) · design gráfico dos 5 modelos · pedido de amostras |
| M3 | Amostras aprovadas · pedido do lote S1–S3 · fabricação PCBA (JLCPCB, 120 placas) |
| M4 | firmware G2 (sequencia_face) + testes · embalagens · loja (Nuvemshop/Shopify) |
| M5 | Recebimento + QC + montagem G1/G2 · conteúdo Drop 0 |
| M6 | Drop 1 → Drop 2 (3–4 semanas de intervalo) |

## Naming (a decidir — M1)

Direções para o nome da marca: (a) palavra PT curta e gráfica que funcione em
7 segmentos no boot do relógio (até 6 letras, sem M/K/V/W/X/Y — ex.: ONDA,
TRENA, SINAL, PAUTA); (b) checar colisão no INPI classe 14 e domínio .com.br
antes de se apegar. O nome dos modelos S/G segue tema único (praia? cidade?
jogos de infância?) definido junto com a marca.

## Próximas ações imediatas

- [ ] Comprar: 1× F-91W, 1× SKMEI 1123, 1× SKMEI 1412, 1× placa Sensor Watch
      (Crowd Supply/Mouser) — kit do protótipo G1
- [ ] Portar/compilar `termo_face` no simulador do Movement (roda no browser)
- [ ] Enviar roteiro de 6 perguntas à SKMEI (PLANO-DA-MARCA.md)
- [ ] Escolher nome + busca prévia INPI
- [ ] Escrever `sequencia_face` (jogo G2) — mesma base da termo_face
