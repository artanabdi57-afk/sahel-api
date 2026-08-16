-- Run only after database/hospital-production-foundation.sql is applied and backend routes are deployed.
alter table public.shops drop constraint shops_business_type_check;
alter table public.shops add constraint shops_business_type_check check (business_type = any (array['shop','gym','school','hospital']));
