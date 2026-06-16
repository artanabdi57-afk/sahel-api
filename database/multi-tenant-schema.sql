create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  phone text unique,
  recovery_email text,
  password_hash text not null,
  shop_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  shop_name text not null,
  location text,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists recovery_email text;
alter table public.products add column if not exists item_id text;
alter table public.sales add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.credits add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.purchase_orders add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.purchase_orders add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.purchase_orders add column if not exists item_id text;
alter table public.expenses add column if not exists shop_id uuid references public.shops(id) on delete cascade;

create index if not exists products_shop_id_idx on public.products(shop_id);
create unique index if not exists users_phone_unique_idx on public.users(phone) where phone is not null;
create index if not exists products_shop_item_id_idx on public.products(shop_id, item_id);
create index if not exists sales_shop_id_idx on public.sales(shop_id);
create index if not exists credits_shop_id_idx on public.credits(shop_id);
create index if not exists purchase_orders_shop_id_idx on public.purchase_orders(shop_id);
create index if not exists expenses_shop_id_idx on public.expenses(shop_id);

alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.credits enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.expenses enable row level security;

create or replace function public.jwt_shop_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'shop_id', '')::uuid;
$$;

drop policy if exists users_own_profile on public.users;
create policy users_own_profile on public.users
  for select using (id::text = auth.jwt() ->> 'user_id');

drop policy if exists shops_own_shop on public.shops;
create policy shops_own_shop on public.shops
  for all using (id = public.jwt_shop_id())
  with check (id = public.jwt_shop_id());

drop policy if exists products_own_shop on public.products;
create policy products_own_shop on public.products
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());

drop policy if exists sales_own_shop on public.sales;
create policy sales_own_shop on public.sales
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());

drop policy if exists credits_own_shop on public.credits;
create policy credits_own_shop on public.credits
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());

drop policy if exists purchase_orders_own_shop on public.purchase_orders;
create policy purchase_orders_own_shop on public.purchase_orders
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());

drop policy if exists expenses_own_shop on public.expenses;
create policy expenses_own_shop on public.expenses
  for all using (shop_id = public.jwt_shop_id())
  with check (shop_id = public.jwt_shop_id());
