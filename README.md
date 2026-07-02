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

## Importante antes de publicar

Este projeto recebe dinheiro e faz split entre criadores. Veja `CLAUDE.md` e o README do backend para o que é obrigatório legalmente (CNPJ, gateways, contador, advogado). Comece validando no Brasil com Pix, uma disputa só, com um pagamento real — antes de internacionalizar.

## Estrutura

Ver `CLAUDE.md` para o mapa completo do projeto e o estado atual.
