-- database/schema.sql — rode no SQL Editor do Supabase (tabelas + regras de segurança)
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente text not null,
  itens jsonb not null,
  total numeric(10,2) not null check (total >= 0),
  data_entrega date not null,
  obs text default '',
  status text not null default 'pendente' check (status in ('pendente','concluido','cancelado')),
  criado_em timestamptz not null default now()
);
create table admins (user_id uuid primary key references auth.users(id));

alter table pedidos enable row level security;
alter table admins  enable row level security;

create policy "admin ve a si" on admins for select to authenticated using (user_id = auth.uid());
-- qualquer cliente pode CRIAR pedido pendente (e nada mais)
create policy "cliente cria" on pedidos for insert to anon, authenticated with check (status = 'pendente');
-- só admin lê e atualiza
create policy "admin le" on pedidos for select to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admin atualiza" on pedidos for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- Depois de criar seu usuário em Authentication → Users:
-- insert into admins (user_id) values ('UUID-DO-SEU-USUARIO');

-- ===== CATÁLOGO =====
create table produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null,
  descricao text default '',
  imagem text default '',
  disponivel boolean not null default true,
  variacoes jsonb not null,          -- [{"rotulo":"500g","preco":45}, ...]
  criado_em timestamptz not null default now()
);
alter table produtos enable row level security;
-- qualquer visitante lê (a vitrine é pública); só admin escreve
create policy "vitrine le" on produtos for select to anon, authenticated using (true);
create policy "admin cria" on produtos for insert to authenticated
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admin edita" on produtos for update to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
create policy "admin exclui" on produtos for delete to authenticated
  using (exists (select 1 from admins a where a.user_id = auth.uid()));
