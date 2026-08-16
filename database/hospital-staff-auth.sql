-- Hospital staff credentials and role/dashboard mapping.
-- Uses Supabase Auth for staff login; credentials are created by management and are not re-created by staff.
create table if not exists public.hospital_staff_credentials (
  staff_id uuid primary key references public.hospital_staff(id) on delete cascade,
  auth_user_id uuid unique not null,
  shop_id uuid not null references public.shops(id) on delete cascade,
  role_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists hospital_staff_credentials_shop_idx on public.hospital_staff_credentials(shop_id);
create index if not exists hospital_staff_credentials_auth_idx on public.hospital_staff_credentials(auth_user_id);
alter table public.hospital_staff_credentials enable row level security;
drop policy if exists hospital_staff_credentials_own_shop on public.hospital_staff_credentials;
create policy hospital_staff_credentials_own_shop on public.hospital_staff_credentials for all using (shop_id = public.jwt_shop_id()) with check (shop_id = public.jwt_shop_id());
