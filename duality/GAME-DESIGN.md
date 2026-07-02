# Duality v2 — design de gamificação e monetização

Este documento explica **o que a v2 adiciona, por quê, e o que ela deliberadamente NÃO faz**.
A mecânica econômica base (dobra de preço, handicap, vitória sustentada 24h, Eterno, split 70/30)
não mudou — ver `CLAUDE.md`.

## A tese

O dinheiro no Duality sempre comprou **território**. A v2 faz cada pagamento comprar também
**palco, voz e pertencimento** — os três motores que fazem gente falar, formar grupo e gastar
de novo. E empacota tudo num formato que streamers querem transmitir, porque cada transmissão
vira um funil de pagamento (do qual o criador leva 70% e a plataforma 30%).

## Os sistemas (e o motivo de cada um)

### 1. Grito de Guerra 📣 — incentivo econômico pra FALAR
Toda jogada pode levar uma frase (máx 80 chars). O gasto define o palco:

| Gasto | Palco |
|---|---|
| qualquer | entra no mural ao vivo |
| 15+ | card destacado com a cor do lado |
| 50+ / Eterno | **toma a tela inteira** (o momento clipável) |

- É o modelo super-chat, mas **o dinheiro continua comprando blocos** — o grito é o palco que
  vem junto. Nada de "doação por mensagem" solta, que criaria um segundo produto pra moderar.
- Não existe chat grátis no mural público: mensagem só entra paga. Isso financia a disputa,
  mata spam e mantém o mural como registro de quem de fato moveu o mercado.
- O criador escreve 3 **gritos prontos** no estúdio ("como a torcida fala") — o fã toca e grita
  com um dedo. Menos fricção, mais identidade.
- Moderação: o grito vive na transação (`transactions.cry`); apagar o campo remove do mural.

### 2. Equipes ⚑ — incentivo social pra RECRUTAR SEM PIRÂMIDE
- Tag de 2–5 caracteres (FIEL, LOBO…), grátis, por disputa. Blocos pagos por membros somam
  pontos da equipe; ranking próprio de equipes ao lado do individual.
- **Equipes ganham STATUS, nunca dinheiro.** Nenhum payout, bônus ou desconto por tamanho de
  equipe. Chamar amigos pra equipe é orgulho de bandeira, não esquema de indicação — a linha
  que separa isto de pirâmide está no `CLAUDE.md` e continua valendo.
- No fim da disputa, o pódio de equipes aparece no monumento — legado coletivo permanente.

### 3. Modo Transmissão ⏺ — feito pra STREAMAR
- Um clique abre a tela de TV: placar gigante, tabuleiro, contagem de vitória, últimos gritos
  e **QR fixo** ("escaneie e entre na disputa"). Layout limpo pra captura no OBS.
- O streamer é (ou traz) o criador da disputa: cada pagamento que a live gera cai no split
  70/30. **A live é o funil; o QR é o checkout.** Marca d'água `duality.app` em toda captura.
- Momentos tier-3 tomam a tela → clipe pronto pra TikTok/Shorts, com nome e grito do pagante.

### 4. Personalização que aparece no mapa
- **Emblema do jogador** (10 emojis): cravado em cada bloco que ele toma. O mapa vira um
  mosaico de identidades, não só de cores — e dá motivo pra defender "meus blocos".
- **Estúdio do criador**: além de nomes/cores/imagens, agora escolhe **skin da arena**
  (Carvão / Neon / Relíquia), escreve os gritos prontos, a **mensagem de vitória** do
  monumento, e vê o **simulador de ganhos** (N apoiadores × gasto médio → sua fatia de 70%).
  O simulador existe pra vender o produto ao criador — é ele quem traz a audiência.

### 5. Momentum visível (só status, nunca vantagem)
- **Combo 🔥**: jogadas seguidas em até 90s empilham um contador animado. Zera sozinho.
- **Meta coletiva ◎**: "faltam N blocos pra X chegar a 60%" — dá propósito a gastos pequenos
  e um marco pro streamer narrar.
- Nenhum dos dois altera preço ou regra: hype é visual; a economia continua a decidida.

## O que a v2 NÃO faz (de propósito)

- **Sem atividade fabricada.** Fora do trailer/home (rotulados como demonstração), todo
  movimento vem de pagamento confirmado por webhook. Combo, hype e metas derivam de jogadas
  reais.
- **Sem pagar por indicação.** `ref` segue sendo só atribuição. Equipes não geram payout.
- **Sem loot box / aleatoriedade paga.** Todo gasto tem resultado determinístico e visível.
- **Sem moeda virtual intermediária.** Dinheiro → blocos, direto. Menos risco regulatório.

## Quem ganha o quê

| Ator | Ganha |
|---|---|
| Jogador | território com seu nome + emblema, voz (grito), bandeira (equipe), clipe (hype) |
| Criador/streamer | **70%** de cada pagamento da sua disputa, skin própria, gritos da sua torcida, funil de live |
| Plataforma (Angelo) | **30%** de cada pagamento, marca em toda captura/share |

## Estado técnico

- Frontend (`components/Duality.jsx` + `components/duality/*`): tudo acima funcionando em
  **modo demo** (estado local, pagamento simulado, rotulado). i18n PT/EN/ES completo.
- Backend: `db/schema.sql` já tem `transactions.cry/crew/flair`, `blocks.flair` e a tabela
  `crews`; `/api/charge` sanitiza e grava os extras; `/api/webhook` aplica flair nos blocos
  e soma pontos da equipe **só quando o pagamento confirma**.
- O mural real lê gritos das últimas transações `paid` (índice já criado).

## Aviso de sempre (não pular)

Feature nova nenhuma vale mais que **processar UM pagamento real** (Pix sandbox → produção,
uma disputa, um criador). A v2 foi desenhada pra não bloquear isso: o caminho de validação do
`CLAUDE.md` continua o mesmo, e os extras sociais degradam graciosamente (grito/equipe/emblema
são colunas opcionais na mesma transação).
