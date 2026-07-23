# Duality v3 — conceito revisado (análise crítica do modelo)

Revisão feita de ponta a ponta sobre o produto real (código + economia), com uma
pergunta só: **o que faz alguém numa live, em 15 segundos, pagar e compartilhar?**
Tudo que não serve a essa pergunta foi cortado ou escondido.

---

## O pitch em uma linha

> **Dois lados. Um mapa ao vivo. Cada real empurra a fronteira — e crava seu nome.**

Se a tela não comunicar isso em 1 segundo, o design falhou. Essa é a régua de
todas as decisões abaixo.

---

## O que VALE a pena no conceito (o núcleo intocável)

| Elemento | Por quê fica |
|---|---|
| **Dois lados + barra de %** | Legível em 1s. É o produto. Todo o resto é moldura. |
| **Dinheiro = território + nome cravado** | Honesto, determinístico, colecionável. Não é aposta: você compra um bem. |
| **Contagem de vitória sustentada** | O motor de drama ("estão a 3h de vencer — derruba!"). Único gatilho de urgência real. |
| **Grito de guerra pago (3 palcos)** | Super-chat comprovado; monetiza a VOZ sem criar produto novo. |
| **Bloco Eterno** | Produto de baleia. Melhor economia unitária do sistema. |
| **Modo TV + QR** | O canal de distribuição. A live é o funil, o QR é o checkout. |
| **Split 70/30** | Criador-primeiro. É o que recruta quem traz audiência. |
| **Sem atividade falsa · sem pirâmide** | Integridade = sobrevivência com gateway e comunidade. |

## O que NÃO vale a pena (cortado agora)

| Corte | Motivo |
|---|---|
| **Trailer na rota crítica** | Link compartilhado em live precisa abrir NO produto. O trailer vira "ver abertura" opcional na home. |
| **Slider de orçamento** | Fiddly no celular, esconde o preço. Vira **fichas fixas: 5 · 10 · 25 · 50** (+ outro). Ancoragem de preço comprovada. |
| **Promo "primeira jogada R$1"** | Caso especial que só existia na demo, sem identidade no servidor (impossível de honrar de verdade) e que quebra a história de preço única. Uma regra a menos = diferencial. |
| **Contabilidade de blocos na cara do comprador** | "tomando os 7 blocos mais baratos de X · fator 0.85" é planilha, não impulso. O comprador vê **"≈ N blocos"**; a matemática (dobra, handicap, zona) continua no servidor, invisível. |
| **Admin multilíngue** | Painel do operador é seu. PT, uma tela, zero cerimônia. |

## O que fica ESCONDIDO (simplificação como diferencial)

A mecânica econômica (preço que dobra, handicap de até 50%, zona de vitória 2×)
**continua exatamente como decidida** — mas vira física do mundo, não interface.
O jogador sente ("tá mais caro fechar", "reconquistar tá barato"), o comprador
nunca calcula. Diferencial real: concorrentes mostram planilha; o Duality mostra
um cabo de guerra.

---

## Variáveis do negócio — revisão

| Variável | Antes | Agora | Racional |
|---|---|---|---|
| **Compra mínima** | R$2 (1 bloco) / promo R$1 | **piso 5** (na moeda da disputa) | Taxa de gateway devora micro-pagamento (Stripe: fixo + %). Piso 5 mantém margem e concentra ação. |
| **Fichas de valor** | slider 2–100 | **5 · 10 · 25 · 50 · outro** | Ancoragem; 25 vira o "médio" natural. Zero digitação no caso comum. |
| **Grito: palcos** | 15+ / 50+ | mantém (≈3× e 10× o piso) | Proporção saudável entre piso e palco máximo. |
| **Eterno** | 100, teto 50 | mantém · roadmap: últimos 10 a +50% | Escassez crescente monetiza o fim do estoque. |
| **Split** | 70/30 | mantém · **faróis: 100/0 na 1ª disputa** | Prova social compra os próximos criadores. Custo de marketing, não desconto. |
| **Duração da vitória** | 24h fixo | **variável por disputa: Relâmpago 1h · Clássica 24h** | JÁ suportado pelo schema (`hold_hours`). Relâmpago = disputa que nasce e MORRE dentro de uma live — o formato do streamer. Clássica = guerra de comunidade multi-dia. |
| **Moeda** | por disputa (BR→Pix, resto→Stripe) | mantém | Internacional já resolvido no circuito de pagamento. |

**Formato Relâmpago é a aposta de tração nº 1**: começo, meio e fim dentro de uma
transmissão. O streamer anuncia, a arena enche, alguém crava a vitória em 1h de
domínio, o monumento sai ainda na live. Loop completo com clímax garantido — sem
depender de ninguém voltar amanhã.

## Viralização — o que foi adicionado ao produto

1. **Link com lado pré-marcado** (`/d/x?lado=a`): "vem pro meu lado" compartilha
   convocação, não convite neutro. Todo share sai com o lado de quem compartilhou.
2. **Unfurl bonito** (OG metadata no servidor): o link da disputa mostra
   "Título — A × B" no WhatsApp/Discord/X, não um link cego.
3. **Rota crítica de 1 tela**: link → arena → ficha de valor → QR. Nada antes do produto.
4. Já existiam e continuam: takeover tier-3 (o clipe), modo TV + QR, cards de share.

## Operação — de SQL pra 1 tela

Novo **/admin** (protegido pelo `DUELS_ADMIN_SECRET`): criar criador, criar
disputa (com duração Relâmpago/Clássica), ver disputas com arrecadação, e
**moderar gritos com um clique** (remove do mural na hora). O que era curl +
SQL Editor virou o painel do operador. Moderação de nome cravado ainda é manual
(ver PUBLICAR.md) — próximo passo do admin.

## Internacional — postura

- Produto já detecta PT/EN/ES e o checkout Stripe fala o idioma do comprador.
- **Sequência**: BR/Pix valida o modelo → EN via streamers (mesmo playbook, outra
  língua) → ES. Nada de "lançar no mundo": lançar num CANAL (um criador por língua).
- Disputas internacionais nascem em USD; piso 5 vale igual (US$5).

## Riscos que o conceito precisa respeitar (do turno anterior, continuam valendo)

- **Arena vazia**: disputa nunca abre sem audiência + horário. Relâmpago existe pra isso.
- **Percepção de aposta**: linguagem sempre de território/colecionável, nunca "aposte".
- **Moderação antes de público**: grito é conteúdo pago público. O admin já remove; falta filtro automático.
- **O marco continua sendo um Pix real.** Nenhuma decisão deste documento vale
  mais que processar um pagamento de verdade com um criador de verdade.
