-- Sahel School: student registry + Primary/Secondary + three-term subject examinations
alter table public.school_students add column if not exists registration_no text;
alter table public.school_students add column if not exists father_name text;
alter table public.school_students add column if not exists mother_name text;
alter table public.school_students add column if not exists phone_number text;
alter table public.school_students add column if not exists age integer;

create unique index if not exists school_students_shop_registration_no_uidx on public.school_students(shop_id, registration_no) where registration_no is not null;

create or replace function public.school_student_registration_no() returns trigger language plpgsql as $$
declare next_no integer;
begin
  if new.registration_no is null or btrim(new.registration_no) = '' then
    select coalesce(max(registration_no::integer), 0) + 1 into next_no from public.school_students where shop_id = new.shop_id and registration_no ~ '^[0-9]+$';
    new.registration_no := next_no::text;
  end if;
  return new;
end;
$$;

create or replace function public.set_school_student_registration_no() returns trigger language plpgsql as $$
declare next_no integer;
begin
  if new.registration_no is null or btrim(new.registration_no) = '' then
    select coalesce(max(registration_no::integer), 0) + 1 into next_no from public.school_students where shop_id = new.shop_id and registration_no ~ '^[0-9]+$';
    new.registration_no := next_no::text;
  end if;
  return new;
end;
$$;

drop trigger if exists school_students_registration_no on public.school_students;
drop trigger if exists school_students_registration_no_trigger on public.school_students;
create trigger school_students_registration_no before insert on public.school_students for each row execute function public.school_student_registration_no();

update public.school_students set registration_no = regexp_replace(registration_no, '^STU-', '', 'i') where registration_no ~* '^STU-[0-9]+$';

alter table public.school_classes add column if not exists level text not null default 'primary';
alter table public.school_classes drop constraint if exists school_classes_level_check;
alter table public.school_classes add constraint school_classes_level_check check (level in ('primary','secondary'));

alter table public.school_exams add column if not exists term text;
alter table public.school_exams add column if not exists academic_year text;
-- Four separate exam maximums. Defaults preserve the existing 20+20+20+20 setup.
alter table public.school_exams add column if not exists assessment_one_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_two_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_three_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_four_max numeric not null default 20;
alter table public.school_exams drop constraint if exists school_exams_assessment_max_check;
alter table public.school_exams add constraint school_exams_assessment_max_check check (
  assessment_one_max >= 1 and assessment_one_max <= 100 and
  assessment_two_max >= 1 and assessment_two_max <= 100 and
  assessment_three_max >= 1 and assessment_three_max <= 100 and
  assessment_four_max >= 1 and assessment_four_max <= 100
);

alter table public.school_exam_results add column if not exists subject text;
update public.school_exam_results set subject='General' where subject is null;
alter table public.school_exam_results alter column subject set default 'General';
alter table public.school_exam_results alter column subject set not null;
alter table public.school_exams drop constraint if exists school_exams_term_check;
alter table public.school_exams add constraint school_exams_term_check check (term is null or term in ('term_1','term_2','term_3'));

drop index if exists school_exam_results_exam_id_student_id_key;
create unique index if not exists school_exam_results_exam_student_subject_uidx on public.school_exam_results(exam_id, student_id, subject);
create unique index if not exists school_exams_shop_class_year_term_uidx on public.school_exams(shop_id, class_id, academic_year, term) where class_id is not null and academic_year is not null and term is not null;
create index if not exists school_students_shop_class_idx on public.school_students(shop_id, class_id);
create index if not exists school_students_shop_registration_idx on public.school_students(shop_id, registration_no);
create index if not exists school_exam_results_student_subject_idx on public.school_exam_results(shop_id, student_id, subject);
