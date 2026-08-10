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
