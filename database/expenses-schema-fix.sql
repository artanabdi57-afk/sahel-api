create extension if not exists "pgcrypto";

create or replace function public.jwt_shop_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'shop_id', '')::uuid;
$$;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  category text not null,
  amount numeric not null default 0,
  description text,
  expense_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.expenses add column if not exists category text;
alter table public.expenses add column if not exists amount numeric not null default 0;
alter table public.expenses add column if not exists description text;
alter table public.expenses add column if not exists expense_date timestamptz not null default now();
alter table public.expenses add column if not exists created_at timestamptz not null default now();

create index if not exists expenses_shop_id_idx on public.expenses(shop_id);
create index if not exists expenses_shop_date_idx on public.expenses(shop_id, expense_date);

alter table public.expenses enable row level security;

drop policy if exists expenses_own_shop on public.expenses;
create policy expenses_own_shop on public.expenses
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());
