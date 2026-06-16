alter table public.users add column if not exists phone text;
alter table public.users add column if not exists recovery_email text;

create unique index if not exists users_phone_unique_idx
  on public.users(phone)
  where phone is not null;
