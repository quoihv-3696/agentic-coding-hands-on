-- ============================================================
-- profiles.department — canonical division for the Live Board "Phòng ban" filter.
-- DISTINCT from dept_code (finer team code, e.g. "ENG"/"CEVC10" shown on cards).
-- Fixed list MUST stay in sync with src/lib/kudos/departments.ts.
-- Applied BEFORE the kudos_feed recreate (20260610010300) which references it.
-- ============================================================
alter table public.profiles
  add column department text;

alter table public.profiles
  add constraint profiles_department_check
  check (department is null or department in ('CEVC1','CEVC2','CEVC3','CEVC4','OPD','Infra'));

create index idx_profiles_department on public.profiles(department);
