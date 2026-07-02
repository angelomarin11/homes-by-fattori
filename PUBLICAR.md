# Duality — passo a passo pra publicar

Ordem pensada pra chegar no **primeiro Pix de sandbox** o mais rápido possível,
e só depois abrir pro mundo. Cada fase termina num marco verificável.

---

## Fase 0 · Separar o repositório (30 min)

O código vive hoje em `homes-by-fattori/duality/` (repositório do site da Telma).
Pra publicar com deploy, domínio e histórico próprios:

1. Crie o repositório `duality` no GitHub (privado).
2. Copie a pasta `duality/` pra ele (ou peça pro Claude fazer a migração preservando histórico).
3. Daqui em diante, tudo referencia o repositório novo.

*Alternativa rápida:* dá pra importar este mesmo repositório na Vercel com
**Root Directory = `duality/`** e adiar a separação — funciona, mas mistura os projetos.

**Marco:** repositório `duality` com `npm install && npm test && npm run build` verdes.

---

## Fase 1 · Infra grátis: Supabase + Vercel (1–2 h)

### Supabase
1. Crie o projeto em [supabase.com](https://supabase.com) (plano free).
2. SQL Editor → cole e rode o `db/schema.sql` inteiro.
3. Crie a função de ranking (SQL Editor):
   ```sql
   create or replace function bump_contribution(p_duel text, p_name text, p_n int)
   returns void language sql as $$
     insert into contributions (duel_id, buyer_name, blocks)
     values (p_duel, p_name, p_n)
     on conflict (duel_id, buyer_name)
     do update set blocks = contributions.blocks + p_n;
   $$;
   ```
4. Database → Replication → ative **Realtime** na tabela `blocks`.
5. Anote: `Project URL`, `anon key`, `service_role key` (Settings → API).

### Vercel
1. Importe o repositório em [vercel.com](https://vercel.com).
2. Environment Variables — preencha (produção e preview):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CRON_SECRET` (string aleatória longa)
   - `NEXT_PUBLIC_SITE_URL` (a URL do deploy)
3. Deploy. O `vercel.json` já agenda o cron de vitória (1/min).
   *Atenção:* cron de 1/min exige plano **Pro** (~US$20/mês); no Hobby o mínimo é
   1/dia — pra fase de sandbox tá ok, a vitória só conclui com atraso.

**Marco:** `https://SEU-DEPLOY/d/qualquercoisa` mostra "disputa não encontrada"
(significa: app no ar falando com o banco).

---

## Fase 2 · Primeira disputa + Pix sandbox (meio dia) ← **O MARCO QUE VALIDA TUDO**

### Pagar.me (sandbox)
1. Crie conta em [pagar.me](https://pagar.me) → pegue as chaves de **teste** (`sk_test_...`).
2. Crie dois *recipients* de teste: você (plataforma) e um criador.
3. Dashboard → Webhooks → aponte pra `https://SEU-DEPLOY/api/webhook`, anote o secret.
4. Preencha na Vercel: `PAGARME_SECRET_KEY`, `PAGARME_PLATFORM_RECIPIENT_ID`,
   `PAGARME_WEBHOOK_SECRET`. Redeploy.

### Semear criador + disputa (SQL Editor do Supabase)
```sql
insert into creators (name, email, country, pagarme_recipient_id, approved)
values ('Criador Teste', 'voce@exemplo.com', 'BR', 're_XXXX', true);
```
Depois crie a disputa via API (o endpoint semeia os 576 blocos):
```bash
curl -X POST https://SEU-DEPLOY/api/duels -H 'Content-Type: application/json' -d '{
  "creatorId": "<uuid do creator>", "title": "Jesus vs Diabo",
  "sideA": "Jesus", "sideB": "Diabo", "colorA": "#F5C84B", "colorB": "#E03A2F",
  "skin": "carvao", "cries": ["Pela Luz!", "Hoje tem virada"], "victoryMsg": "A fé moveu o mapa."
}'
```
⚠️ `/api/duels` ainda não tem autenticação — antes de divulgar o domínio,
proteja com um header secreto (ver Pendências).

### O teste de verdade
1. Abra `/d/<id>` no celular.
2. Escolha lado, emblema, equipe, escreva um grito, mova por R$10.
3. Pague o Pix de teste (o sandbox do Pagar.me tem simulador de pagamento).
4. **Veja os blocos pintarem sozinhos** (webhook → Realtime), o grito no mural,
   a equipe pontuando e o split 70/30 na dashboard do Pagar.me.

**Marco:** um pagamento sandbox de ponta a ponta com split correto. 🏁

---

## Fase 3 · Endurecer antes de abrir ao público (1–2 semanas, em paralelo)

Código (pendências conhecidas — ver CLAUDE.md):
- [ ] Autenticação no `/api/duels` (hoje qualquer um com um creatorId aprovado publica).
- [ ] Painel de moderação: apagar `transactions.cry`, renomear `owner_name`, pausar disputa.
      Grito é conteúdo público pago — filtro de palavras + remoção são obrigatórios.
- [ ] QR real no modo TV (gerar QR do link `/d/[id]`; hoje é visual).
- [ ] Rate limiting no `/api/charge` (evitar flood de transações pending).
- [ ] Decidir promo de primeira jogada no servidor (hoje só existe na demo).

Não-código (obrigatório pra receber dinheiro de verdade):
- [ ] CNPJ + conta PJ.
- [ ] Contas de PRODUÇÃO no Pagar.me (KYC leva dias) — refazer chaves na Vercel.
- [ ] Contador: emissão de nota do fee de 30% e obrigações do split.
- [ ] Advogado: Termos de Uso, LGPD, termo do Bloco Eterno, política de moderação.
- [ ] Domínio (o app assina `duality.app` nos shares — registre ou ajuste a marca).

**Marco:** primeiro Pix REAL de R$2 numa disputa com um criador de verdade.

---

## Fase 4 · Internacional (liga quando o BR estiver validado)

O código já está pronto (Stripe Checkout hospedado + Connect, webhook assinado):
1. Conta Stripe da plataforma (exige a entidade legal da Fase 3).
2. Ative **Connect** → onboarding **Express** pros criadores internacionais;
   salve o id em `creators.stripe_account_id`.
3. Webhook: `https://SEU-DOMINIO/api/webhook` com evento `checkout.session.completed`;
   preencha `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` na Vercel.
4. Crie uma disputa com `currency: "USD"` — o mesmo `/d/[id]` mostra o botão de
   cartão no idioma do comprador (Apple Pay/Google Pay inclusos).

**Marco:** um pagamento de cartão em sandbox Stripe com split 70/30 via Connect.

---

## Fase 5 · Lançamento com streamer (o modelo de crescimento)

1. Escolha UM criador com audiência ao vivo (o "Padre André" da tese).
2. Crie a disputa dele, abra o **modo TV** (`⏺ TV`) e capture no OBS.
3. A live narra a disputa; o QR na tela converte espectador em jogador;
   momentos de 50+ tomam a tela → clipes pra TikTok/Shorts.
4. Meça: pagamentos/hora de live, ticket médio, % com grito, equipes formadas.

**Marco:** uma live com pagamentos entrando em tempo real na tela.
