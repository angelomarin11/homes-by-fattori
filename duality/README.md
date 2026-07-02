# Duality

Disputa social ao vivo. Dois lados, blocos pagos, o nome de quem paga fica cravado.

**v2 — gamificação social:** grito de guerra pago (mural → destaque → tela inteira),
equipes com ranking próprio (status, nunca payout), modo transmissão pra OBS com QR,
emblemas no mapa, skins de arena e estúdio do criador com simulador de ganhos (split 70/30).
Racional completo em `GAME-DESIGN.md`.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev
```

Abra http://localhost:3000

## Setup completo

1. **Supabase:** crie um projeto, rode `db/schema.sql` no SQL Editor, ative Realtime na tabela `blocks`, crie a função `bump_contribution` (ver `db/schema.sql` e o README do backend).
2. **Variáveis:** preencha `.env.local` com as chaves do Supabase, Pagar.me e Stripe.
3. **Deploy:** conecte ao Vercel. O `vercel.json` já configura o cron de vitória.

## Internacional

O produto opera em dois circuitos de pagamento, decididos pela **moeda da disputa**
(`duels.currency`, definida pelo país do criador):

| | Brasil | Internacional |
|---|---|---|
| Moeda | BRL | USD, EUR, … |
| Gateway | Pagar.me (Pix) | **Stripe Checkout** (hospedado) |
| Split 70/30 | split nativo do pedido | `transfer_data` + `application_fee_amount` (Connect) |
| Criador recebe | `creators.pagarme_recipient_id` | `creators.stripe_account_id` (conta Express) |
| Webhook | `order.paid` (HMAC x-hub-signature) | `checkout.session.completed` (HMAC `stripe-signature` verificado com anti-replay) |

- O checkout do Stripe abre no idioma do comprador, com Apple Pay/Google Pay e SCA —
  nenhuma UI de cartão pra manter.
- A interface detecta PT/EN/ES no navegador (dicionário em `components/duality/i18n.js`;
  adicionar um idioma = adicionar um bloco no `DICT`).
- Onboarding de criador internacional: criar conta **Stripe Connect Express** pra ele e
  salvar o id em `creators.stripe_account_id` (mesma curadoria fechada do Brasil).
- Estratégia: valide o Brasil com Pix primeiro; ligar o internacional é preencher
  `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` e aprovar criadores com conta Connect.

## Importante antes de publicar

Este projeto recebe dinheiro e faz split entre criadores. Veja `CLAUDE.md` e o README do backend para o que é obrigatório legalmente (CNPJ, gateways, contador, advogado). Comece validando no Brasil com Pix, uma disputa só, com um pagamento real — antes de internacionalizar.

## Estrutura

Ver `CLAUDE.md` para o mapa completo do projeto e o estado atual.
