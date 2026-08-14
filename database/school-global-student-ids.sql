-- Global school-wide student IDs: one sequence per school, never restarting by class.
create or replace function public.set_school_student_registration_no() returns trigger language plpgsql as $$
declare next_no integer;
begin
  if new.registration_no is null or btrim(new.registration_no) = '' then
    select coalesce(max(registration_no::integer), 0) + 1 into next_no
    from public.school_students
    where shop_id = new.shop_id and registration_no ~ '^[0-9]+$';
    new.registration_no := next_no::text;
  end if;
  return new;
end;
$$;

drop trigger if exists school_students_registration_no_trigger on public.school_students;
create trigger school_students_registration_no_trigger
before insert on public.school_students
for each row execute function public.set_school_student_registration_no();

with numbered as (
  select id, row_number() over(partition by shop_id order by created_at, id) as rn
  from public.school_students
)
update public.school_students s
set registration_no = n.rn::text
from numbered n
where s.id = n.id;

alter table public.school_students drop constraint if exists school_students_registration_no_format_check;
alter table public.school_students add constraint school_students_registration_no_format_check
check (registration_no is null or registration_no ~ '^[0-9]+$');
