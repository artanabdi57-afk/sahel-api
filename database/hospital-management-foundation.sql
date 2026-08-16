-- Sahel Hospital Management Foundation
-- Safe to run after the existing multi-tenant schema.
create extension if not exists "pgcrypto";

alter table public.shops add column if not exists business_type text;

create table if not exists public.hospital_departments (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null, code text, active boolean not null default true, created_at timestamptz not null default now(),
  unique(shop_id, name)
);
create table if not exists public.hospital_staff (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null, employee_id text, full_name text not null,
  role text not null, department_id uuid references public.hospital_departments(id) on delete set null,
  phone text, license_number text, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.hospital_patients (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  patient_code text not null, full_name text not null, gender text, date_of_birth date, phone text,
  blood_group text, address text, emergency_contact text, created_at timestamptz not null default now(),
  unique(shop_id, patient_code)
);
create table if not exists public.hospital_appointments (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade,
  doctor_id uuid references public.hospital_staff(id) on delete set null,
  department_id uuid references public.hospital_departments(id) on delete set null,
  starts_at timestamptz not null, ends_at timestamptz, status text not null default 'scheduled',
  payment_status text not null default 'unpaid', notes text, created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.hospital_attendance_devices (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null, location text, manufacturer text, model text, device_type text not null,
  connection_type text, external_device_id text, status text not null default 'offline', last_event_at timestamptz,
  config jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  unique(shop_id, external_device_id)
);
create table if not exists public.hospital_attendance_identities (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  staff_id uuid references public.hospital_staff(id) on delete cascade,
  external_device_id uuid not null references public.hospital_attendance_devices(id) on delete cascade,
  external_user_id text not null, method text not null, created_at timestamptz not null default now(),
  unique(external_device_id, external_user_id)
);
create table if not exists public.hospital_attendance_events (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  device_id uuid references public.hospital_attendance_devices(id) on delete set null,
  staff_id uuid references public.hospital_staff(id) on delete set null,
  event_type text not null, method text not null, occurred_at timestamptz not null,
  external_event_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  unique(device_id, external_event_id)
);
create table if not exists public.hospital_medicines (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null, sku text, quantity numeric not null default 0, reorder_level numeric not null default 0,
  expiry_date date, unit_cost numeric(12,2) not null default 0, selling_price numeric(12,2) not null default 0,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.hospital_lab_requests (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade,
  requested_by uuid references public.hospital_staff(id) on delete set null, test_name text not null,
  status text not null default 'pending', result jsonb, requested_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.hospital_bills (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade, invoice_number text not null,
  total numeric(12,2) not null default 0, paid numeric(12,2) not null default 0,
  status text not null default 'unpaid', created_at timestamptz not null default now(), unique(shop_id, invoice_number)
);

create table if not exists public.hospital_role_permissions (
  id uuid primary key default gen_random_uuid(), shop_id uuid not null references public.shops(id) on delete cascade,
  role text not null, permission text not null, scope text not null default 'shop', enabled boolean not null default true,
  unique(shop_id, role, permission)
);

create index if not exists hospital_patients_shop_idx on public.hospital_patients(shop_id);
create index if not exists hospital_appointments_schedule_idx on public.hospital_appointments(shop_id, starts_at, doctor_id);
create index if not exists hospital_attendance_events_staff_time_idx on public.hospital_attendance_events(shop_id, staff_id, occurred_at desc);
create index if not exists hospital_devices_shop_idx on public.hospital_attendance_devices(shop_id);
create index if not exists hospital_staff_shop_idx on public.hospital_staff(shop_id);

-- Tenant isolation. Role/scope checks should be enforced by the application/API in addition to these policies.
-- Do not expose salary/HR or clinical records simply because a user belongs to the same hospital.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['hospital_departments','hospital_staff','hospital_patients','hospital_appointments','hospital_attendance_devices','hospital_attendance_identities','hospital_attendance_events','hospital_medicines','hospital_lab_requests','hospital_bills','hospital_role_permissions'] LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
    EXECUTE format('drop policy if exists hospital_tenant_isolation on public.%I', t);
    EXECUTE format('create policy hospital_tenant_isolation on public.%I for all using (shop_id = public.jwt_shop_id()) with check (shop_id = public.jwt_shop_id())', t);
  END LOOP;
END $$;

-- Default roles. Management receives the broadest scope; operational roles are deliberately narrow.
-- These are templates; individual hospitals can customize permissions from the admin UI in the next phase.
