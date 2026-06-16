create table if not exists public.credit_payments (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid not null references public.credits(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  amount_paid decimal(10,2) not null,
  payment_date timestamp default now(),
  payment_method text default 'cash' check (payment_method in ('cash', 'bank')),
  notes text,
  created_at timestamp default now()
);

create index if not exists credit_payments_credit_id_idx on public.credit_payments(credit_id);
create index if not exists credit_payments_shop_id_idx on public.credit_payments(shop_id);
create index if not exists credit_payments_payment_date_idx on public.credit_payments(payment_date);

alter table public.credit_payments enable row level security;

drop policy if exists credit_payments_own_shop on public.credit_payments;
create policy credit_payments_own_shop on public.credit_payments
for all
using (shop_id::text = current_setting('request.jwt.claims', true)::jsonb->>'shop_id')
with check (shop_id::text = current_setting('request.jwt.claims', true)::jsonb->>'shop_id');
