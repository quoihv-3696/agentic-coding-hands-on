-- ============================================================
-- Hearts economy (spec C.4.1)
-- A heart credits the SENDER of the kudo. Each reaction stores how many hearts
-- it awarded (1 normally, 2 on an admin-configured special day) so that an
-- UNLIKE revokes the EXACT amount — resolved at INSERT time, never re-derived.
-- ============================================================

-- How many hearts THIS reaction granted (resolved at insert against special_days).
alter table public.kudo_reactions
  add column hearts_awarded smallint not null default 1
  check (hearts_awarded in (1, 2));

-- Admin-configured special days (×2 hearts). No admin UI yet — rows are seeded /
-- inserted via service role for now. Compared in Asia/Ho_Chi_Minh (see actions.ts).
create table public.special_days (
  event_date  date primary key,
  multiplier  smallint not null default 2 check (multiplier in (1, 2)),
  label       text,
  created_at  timestamptz not null default now()
);

alter table public.special_days enable row level security;

-- Read-only to authenticated; writes happen via service role (admin task later).
create policy "special_days: authenticated select"
  on public.special_days for select
  to authenticated
  using (true);

grant select on public.special_days to authenticated;
