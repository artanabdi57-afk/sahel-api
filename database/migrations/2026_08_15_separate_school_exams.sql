-- Sahel School: four independent exams per class/year.
-- Run after the existing school examination migrations.

alter table public.school_exams add column if not exists exam_number integer;

-- Preserve the old term-based records instead of collapsing them all into Exam 1.
update public.school_exams
set exam_number = case term
  when 'term_1' then 1
  when 'term_2' then 2
  when 'term_3' then 3
  else 1
end
where exam_number is null;

alter table public.school_exams alter column exam_number set default 1;
alter table public.school_exams drop constraint if exists school_exams_exam_number_check;
alter table public.school_exams add constraint school_exams_exam_number_check check (exam_number between 1 and 4);

-- The old unique term-per-class rule prevents four independent exams.
drop index if exists public.school_exams_shop_class_year_term_uidx;
create unique index if not exists school_exams_shop_class_year_exam_no_uidx
  on public.school_exams(shop_id, class_id, academic_year, exam_number)
  where class_id is not null and academic_year is not null and exam_number is not null;

create index if not exists school_exams_shop_class_year_idx
  on public.school_exams(shop_id, class_id, academic_year);

-- Keep the legacy term column for backward compatibility, but the UI/API uses exam_number.
alter table public.school_exams drop constraint if exists school_exams_term_check;
alter table public.school_exams add constraint school_exams_term_check check (term is null or term in ('term_1','term_2','term_3'));
