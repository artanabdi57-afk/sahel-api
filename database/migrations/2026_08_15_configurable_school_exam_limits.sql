-- Allow each of the four exams in a school term to have its own maximum mark.
alter table public.school_exams add column if not exists assessment_one_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_two_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_three_max numeric not null default 20;
alter table public.school_exams add column if not exists assessment_four_max numeric not null default 20;

alter table public.school_exams drop constraint if exists school_exams_assessment_max_check;
alter table public.school_exams add constraint school_exams_assessment_max_check check (
  assessment_one_max >= 0 and assessment_one_max <= 100 and
  assessment_two_max >= 0 and assessment_two_max <= 100 and
  assessment_three_max >= 0 and assessment_three_max <= 100 and
  assessment_four_max >= 0 and assessment_four_max <= 100
);
