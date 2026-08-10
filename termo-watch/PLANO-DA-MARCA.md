# Plano — microbrand brasileira de relógios com jogos

Objetivo: uma marca brasileira de relógios digitais "toy-grade premium" cujo
diferencial é vir com **jogos embarcados** (Termo, genius/simon, forca,
2048 de segmentos...), estética retrô anos 80/90.

## Fase 0 — Prova de conceito (agora, custo ~R$ 500)

1. Comprar um Casio F-91W + placa Sensor Watch.
2. Portar/testar a `termo_face` (este repositório, pasta `firmware/`).
3. Validar a diversão real do jogo no pulso — o LCD de 6 dígitos é limitado;
   é aqui que se descobre o que funciona.

## Fase 1 — Lote maker (10–50 unidades)

- Relógios F-91W + Sensor Watch montados, com firmware da marca (menu de
  jogos próprio, animação de boot com o nome da marca).
- **Rota SKMEI desde já:** o módulo Casio 593 (do F-91W) encaixa na caixa do
  **SKMEI 1123** (clone de metal do A158W) — relatos da comunidade confirmam a
  troca nesse sentido (o inverso, módulo SKMEI em caixa Casio, não cabe).
  Ou seja: caixa SKMEI 1123 + chassi do módulo 593 + placa Sensor Watch =
  **relógio SKMEI rodando o Termo**. O SKMEI 1412 (clone do F-91W em resina) é
  outro candidato a testar. Validar encaixe, alinhamento de botões e zebra
  strip do LCD com 1 unidade antes de comprar lote.
- **Atenção jurídica:** revender um Casio modificado é legal (produto usado /
  customizado), mas **não pode** apresentar o produto como se fosse da marca
  própria escondendo que a base é Casio, nem remover/encobrir a marca Casio e
  aplicar a sua por cima para venda como produto novo. O posicionamento correto
  é "mod kit / relógio Casio customizado por <marca>". A marca própria de
  verdade nasce na Fase 2.
- Canal: Instagram/TikTok + Tindie/Etsy + comunidade maker BR.

## Fase 2 — Produto próprio (ODM chinês, 300–1000 unidades)

- **Caixa/pulseira/montagem:** fábricas ODM como a
  [SKMEI](https://www.skmeifactory.com/) (Guangzhou) fazem OEM/ODM com marca
  própria; MOQ típico de fábricas desse porte fica entre 300 e 1000 peças por
  modelo (negociar direto — eles não publicam MOQ).
- **Módulo eletrônico:** aqui está o diferencial — o módulo padrão do ODM não
  roda seu firmware. Duas rotas:
  - **Rota A (mais controle):** projetar módulo próprio — MCU Microchip
    SAM L22 (o mesmo do Sensor Watch, driver de LCD de segmentos integrado,
    consumo baixíssimo) + LCD de segmentos custom (ferramental de LCD custom
    custa pouco, na casa de poucas centenas de dólares) + placa de 4 camadas.
    O Sensor Watch é open source (design de hardware publicado) e serve de
    ponto de partida legal e técnico — verificar a licença exata antes de
    derivar comercialmente.
  - **Rota B (mais rápida):** encomendar ao ODM a caixa aceitando o formato de
    módulo do F-91W e continuar usando placas estilo Sensor Watch fabricadas
    por você (JLCPCB/PCBA já monta o SAM L22).
- **LCD custom** é a arma secreta do design: dá pra desenhar segmentos
  dedicados ao jogo (grade 5×6 de mini-segmentos para o Termo, ícones de
  acerto etc.) por custo de ferramental baixo.

## Estudo de caso — Farr + Swit (Retro Digital "Mix Tape")

Microbrand americana de Elmhurst/Chicago (3 fundadores: Farrand, Paetzold,
Switalski) que mostra o playbook funcionando:

- **Construíram audiência antes:** começaram (~2015) com relógios automáticos
  de movimento suíço montados nos EUA; anos de presença em fóruns
  (WatchUSeek) e imprensa especializada (aBlogtoWatch, Time Bum).
- **O digital retrô deles é módulo genérico chinês de prateleira** — review do
  Time Bum: "não diz quem fez o módulo porque honestamente não importa".
  Caixa plástica 35mm, CR2016, luz teal, 50m WR. Zero engenharia própria.
- **Todo o valor está no design e na narrativa:** estética anos 80 inspirada
  em fitas cassete/Memorex, edições numeradas como discos ("Mix Tape Vol. 1",
  "B Sides Vol. 2 XL"), preço de impulso (US$ 34,99; 2 por US$ 59,99),
  lançamentos em "drops".

**Tradução para o nosso plano:** a linha deles é exatamente o nível
"semi-custom SKMEI" da tabela abaixo — realizável hoje, com MOQ ~100–300,
sem escrever uma linha de código. Isso vira uma **Fase 1.5**: uma linha
retrô-digital BR com módulo de prateleira para gerar caixa, marca e
audiência, enquanto o módulo com jogos (o diferencial que a Farr + Swit NÃO
tem) amadurece como produto-âncora da Fase 2.

## SKMEI na prática — números reais (pesquisa ago/2026)

A SKMEI (Guangdong Skmei Watch Manufacture Co., Ltd., Guangzhou) vende por
três canais: [skmei.com](https://www.skmei.com/),
[skmeifactory.com](https://www.skmeifactory.com/) e lojas oficiais no Alibaba
([gzskmei](https://gzskmei.en.alibaba.com/)). Níveis de customização e MOQs
típicos anunciados:

| Nível | O que muda | MOQ típico | Observação |
|---|---|---|---|
| Atacado de modelo de linha | nada (sem logo) | 2–20 pçs | preço unitário ~US$ 2–8 |
| Logo próprio (OEM) | logo no mostrador, tampa, embalagem | ~100 pçs (anúncios citam 10 pçs para "trial production") | serviço de arte incluso |
| Semi-custom | cores, pulseira, mostrador novo em caixa existente | 100–300 pçs | negociar direto |
| Full custom (molde novo) | caixa/design exclusivo | 500–3000 pçs | molde ~US$ 500–2000, prazo 45–90 dias |

**Ponto crítico — firmware:** a SKMEI **não grava firmware seu** nos módulos
de linha. Os módulos digitais deles usam chip COB de máscara (programado na
fundição do chip); mudar o comportamento do relógio exigiria um chip novo em
volume de dezenas de milhares. Portanto, para o jogo existir num SKMEI, o
módulo tem que ser **seu** (MCU regravável tipo SAM L22), e a SKMEI entra com
caixa, pulseira, montagem, embalagem e logística. Fábricas de módulo/LCD
fazem semi-custom com MOQ de 50–100 módulos e ferramental de LCD custom na
faixa de US$ 300–800.

**Perguntas para mandar à SKMEI (em inglês, via Alibaba/skmeifactory):**

1. What is the MOQ and unit price for model 1123 (metal) / 1412 (resin)
   without logo, and with our logo on dial + caseback?
2. Can you supply **cases only** (case, strap, buttons, gaskets, glass),
   without the module, at lower MOQ? What price?
3. Can you assemble watches using **our own electronic module** (we supply
   tested modules; you do casing, QC, water resistance test, packaging)?
   What is the assembly fee per unit and MOQ?
4. Which of your case designs accept a module of the same dimensions as the
   Casio 593 module?
5. Tooling cost, MOQ and lead time for a fully custom case design?
6. Do you provide IP protection (NNN agreement) for custom designs?

A pergunta 3 é o modelo de negócio-alvo: **módulo seu + casco/montagem SKMEI**.
Se a SKMEI não aceitar montar com módulo de terceiro, alternativas na mesma
região fazem isso (buscar "watch assembly service" / module factories em
Dongguan e Shenzhen via Alibaba e Made-in-China).

## Burocracia Brasil

- **Marca:** registrar no INPI (classe 14 — relógios; classe 9 se tiver
  eletrônico de consumo/software). ~R$ 355 por classe com desconto de ME/EPP.
- **Certificação:** relógio digital **sem rádio** (sem Bluetooth/Wi-Fi) **não
  precisa de homologação ANATEL** — grande vantagem de ficar offline. Se um dia
  tiver BLE, precisa homologar.
- **Importação:** produto acabado de relógio paga II + IPI + ICMS relevantes;
  importar componentes e montar no BR (ou vender como kit) muda a equação —
  vale modelar os dois cenários antes da Fase 2.
- **Empresa:** ME/EPP no Simples; NCM de relógios de pulso digitais: 9102.12.

## Financiamento

- Pré-venda/crowdfunding: Catarse (BR) ou Kickstarter/Crowd Supply (global —
  o próprio Sensor Watch nasceu no Crowd Supply e é a prova de que esse
  público existe e paga).

## Nome/posicionamento (a decidir)

Pontos fortes do pitch: "o relógio que te dá 5 minutos de jogo por dia, sem
tela, sem notificação, com 1 ano de bateria". O Termo diário cai perfeito
nesse formato: **uma palavra por dia, no pulso**.
