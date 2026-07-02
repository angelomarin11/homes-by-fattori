-- ============================================================================
--  DUALITY · schema de produção (Supabase / Postgres)
--  Suporta: disputas multi-idioma, blocos com preço dinâmico, split por país,
--  validação de vitória em 24h server-side, Eternos com escassez.
-- ============================================================================

-- CRIADORES (curadoria fechada). Cada um é recipient no gateway do seu país.
create table creators (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text unique not null,
  country       text not null default 'BR',        -- define o gateway: BR→Pix, outros→Stripe
  pagarme_recipient_id text,                        -- p/ criadores BR (split Pix)
  stripe_account_id    text,                        -- p/ criadores internacionais (Connect)
  approved      boolean default false,              -- você aprova antes de publicar
  created_at    timestamptz default now()
);

-- DISPUTAS
create table duels (
  id            text primary key default substr(md5(random()::text), 1, 8),
  creator_id    uuid not null references creators(id),
  title         text not null,
  side_a        text not null,
  side_b        text not null,
  color_a       text not null,
  color_b       text not null,
  img_a         text,                               -- URL no Supabase Storage
  img_b         text,
  grid          int not null default 24,
  base_price    numeric(10,2) not null default 2.00,
  currency      text not null default 'BRL',
  -- personalização do criador (estúdio v2)
  skin          text not null default 'carvao'      -- carvao | neon | ouro
                check (skin in ('carvao','neon','ouro')),
  cries         text[] not null default '{}',       -- gritos prontos da torcida (máx 3)
  victory_msg   text,                               -- mensagem exibida no monumento
  win_pct       int not null default 80,
  hold_hours    int not null default 24,
  eternal_cap   int not null default 50,
  eternal_price numeric(10,2) not null default 100.00,
  -- estado da vitória sustentada (server-side)
  status        text not null default 'active'      -- active | won
                check (status in ('active','won')),
  leading_side  char(1),                            -- quem está na zona de vitória
  hold_until    timestamptz,                        -- prazo pra cravar a vitória
  winner        char(1),
  created_at    timestamptz default now(),
  won_at        timestamptz
);

-- BLOCOS: um registro por posição conquistada. price = custo pra TOMAR este bloco.
create table blocks (
  duel_id    text not null references duels(id),
  pos        int  not null,
  side       char(1) not null check (side in ('a','b')),
  owner_name text,
  flair      text,                                  -- emblema (emoji) do conquistador
  price      numeric(10,2) not null,                -- dobra a cada reconquista
  eternal    boolean default false,                 -- imune; nunca tomado
  txn_id     uuid,
  updated_at timestamptz default now(),
  primary key (duel_id, pos)
);

-- TRANSAÇÕES: nascem pending, viram paid no webhook. Bloco só muda quando paid.
create table transactions (
  id            uuid primary key default gen_random_uuid(),
  duel_id       text not null references duels(id),
  side          char(1) not null,
  kind          text not null default 'blocks'      -- blocks | eternal
                check (kind in ('blocks','eternal')),
  positions     int[] not null default '{}',        -- quais blocos esta txn toma
  buyer_name    text,
  gross         numeric(10,2) not null,
  creator_cut   numeric(10,2) not null,             -- 70%
  platform_cut  numeric(10,2) not null,             -- 30%
  currency      text not null,
  gateway       text not null,                      -- pix | stripe
  gateway_id    text,
  cry           text,                               -- grito de guerra (máx 80 chars; moderável)
  crew          text,                               -- tag da equipe do comprador (só status)
  flair         text,                               -- emblema aplicado aos blocos desta txn
  ref           text,                               -- atribuição de recrutamento (não recompensa)
  status        text not null default 'pending'
                check (status in ('pending','paid','failed','expired')),
  created_at    timestamptz default now(),
  paid_at       timestamptz
);

-- RANKING (derivado, mas materializado pra performance)
create table contributions (
  duel_id    text not null references duels(id),
  buyer_name text not null,
  blocks     int not null default 0,
  primary key (duel_id, buyer_name)
);

-- EQUIPES: tag coletiva por disputa. SÓ STATUS — nenhum payout ligado a equipe.
-- points = blocos pagos por membros. O ranking de equipes é vitrine social.
create table crews (
  duel_id    text not null references duels(id),
  tag        text not null,                         -- 2–5 chars A-Z0-9
  side       char(1) not null check (side in ('a','b')),
  points     int not null default 0,
  created_at timestamptz default now(),
  primary key (duel_id, tag)
);

create index on blocks (duel_id);
create index on transactions (status);
create index on transactions (duel_id, status, paid_at);  -- mural de gritos pagos
create index on duels (status);

-- ROW LEVEL SECURITY: leitura pública, escrita só pelo backend (service_role).
alter table duels enable row level security;
alter table blocks enable row level security;
alter table contributions enable row level security;
alter table crews enable row level security;
create policy "public read duels" on duels for select using (true);
create policy "public read blocks" on blocks for select using (true);
create policy "public read ranking" on contributions for select using (true);
create policy "public read crews" on crews for select using (true);
-- (sem policy de INSERT/UPDATE = ninguém escreve direto; só o service_role do backend)

-- MURAL: o frontend lê os gritos das últimas transações PAGAS (cry not null).
-- Nada de mensagens grátis anônimas no mural público — grito só entra pago,
-- o que financia a disputa e desestimula spam. Moderação: apagar cry na txn.

-- NOTA: nenhuma tabela de "recompensa por recrutamento". 'ref' é só atribuição.
-- Pagar por indicação em vez de pelo bloco caracteriza pirâmide. Não fazer.
