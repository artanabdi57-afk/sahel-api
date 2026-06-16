alter table public.users
add column if not exists status text not null default 'active'
check (status in ('active', 'suspended'));

alter table public.shops
add column if not exists status text not null default 'active'
check (status in ('active', 'suspended'));

create index if not exists users_status_idx on public.users(status);
create index if not exists shops_status_idx on public.shops(status);
