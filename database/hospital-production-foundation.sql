-- Hospital production foundation.
-- Apply this migration before enabling business_type = 'hospital'.
-- No SECURITY DEFINER functions are introduced here.

create extension if not exists "pgcrypto";

create table if not exists public.hospital_departments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (shop_id, name)
);

create table if not exists public.hospital_staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  employee_id text,
  full_name text not null,
  role text not null,
  department_id uuid references public.hospital_departments(id) on delete set null,
  phone text,
  license_number text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_patients (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  patient_code text not null,
  full_name text not null,
  gender text,
  date_of_birth date,
  phone text,
  blood_group text,
  address text,
  emergency_contact text,
  created_at timestamptz not null default now(),
  unique (shop_id, patient_code)
);

create table if not exists public.hospital_appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade,
  doctor_id uuid references public.hospital_staff(id) on delete set null,
  department_id uuid references public.hospital_departments(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled',
  payment_status text not null default 'unpaid',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_medicines (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  sku text,
  quantity numeric not null default 0,
  reorder_level numeric not null default 0,
  expiry_date date,
  unit_cost numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hospital_lab_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade,
  requested_by uuid references public.hospital_staff(id) on delete set null,
  test_name text not null,
  status text not null default 'pending',
  result jsonb,
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.hospital_bills (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  patient_id uuid not null references public.hospital_patients(id) on delete cascade,
  invoice_number text not null,
  total numeric(12,2) not null default 0,
  paid numeric(12,2) not null default 0,
  status text not null default 'unpaid',
  created_at timestamptz not null default now(),
  unique (shop_id, invoice_number)
);

create table if not exists public.hospital_attendance_devices (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  location text,
  manufacturer text,
  model text,
  device_type text not null,
  connection_type text,
  external_device_id text,
  status text not null default 'offline',
  last_event_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (shop_id, external_device_id)
);

create table if not exists public.hospital_role_permissions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  role text not null,
  permission text not null,
  scope text not null default 'shop',
  enabled boolean not null default true,
  unique (shop_id, role, permission)
);

-- Cover every foreign key with an index so tenant joins and deletes do not fall back to scans.
create index if not exists hospital_departments_shop_idx on public.hospital_departments(shop_id);
create index if not exists hospital_staff_shop_idx on public.hospital_staff(shop_id);
create index if not exists hospital_staff_user_idx on public.hospital_staff(user_id);
create index if not exists hospital_staff_department_idx on public.hospital_staff(department_id);
create index if not exists hospital_patients_shop_idx on public.hospital_patients(shop_id);
create index if not exists hospital_appointments_shop_idx on public.hospital_appointments(shop_id);
create index if not exists hospital_appointments_patient_idx on public.hospital_appointments(patient_id);
create index if not exists hospital_appointments_doctor_idx on public.hospital_appointments(doctor_id);
create index if not exists hospital_appointments_department_idx on public.hospital_appointments(department_id);
create index if not exists hospital_appointments_created_by_idx on public.hospital_appointments(created_by);
create index if not exists hospital_appointments_schedule_idx on public.hospital_appointments(shop_id, starts_at, doctor_id);
create index if not exists hospital_medicines_shop_idx on public.hospital_medicines(shop_id);
create index if not exists hospital_lab_requests_shop_idx on public.hospital_lab_requests(shop_id);
create index if not exists hospital_lab_requests_patient_idx on public.hospital_lab_requests(patient_id);
create index if not exists hospital_lab_requests_requested_by_idx on public.hospital_lab_requests(requested_by);
create index if not exists hospital_bills_shop_idx on public.hospital_bills(shop_id);
create index if not exists hospital_bills_patient_idx on public.hospital_bills(patient_id);
create index if not exists hospital_devices_shop_idx on public.hospital_attendance_devices(shop_id);
create index if not exists hospital_role_permissions_shop_idx on public.hospital_role_permissions(shop_id);

-- Tenant isolation. Keep USING and WITH CHECK together for UPDATE/UPSERT safety.
do $$
declare
  t text;
begin
  foreach t in array array[
    'hospital_departments',
    'hospital_staff',
    'hospital_patients',
    'hospital_appointments',
    'hospital_medicines',
    'hospital_lab_requests',
    'hospital_bills',
    'hospital_attendance_devices',
    'hospital_role_permissions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists hospital_own_shop on public.%I', t);
    execute format('create policy hospital_own_shop on public.%I for all to authenticated using (shop_id = public.jwt_shop_id()) with check (shop_id = public.jwt_shop_id())', t);
  end loop;
end $$;
