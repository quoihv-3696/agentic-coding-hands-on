-- ============================================================================
-- prod-setup.sql — one-shot Supabase PROD setup (paste into Dashboard → SQL Editor → Run)
--
-- Run ONCE on a fresh project (Table Editor shows no kudos/profiles tables yet).
-- It: creates the schema + RLS + storage bucket + views + RPC, seeds the profile
-- directory, then links any EXISTING auth user to their profile by email
-- (so your already-logged-in Gmail can send Kudos without re-login).
--
-- NOTE: this is a generated convenience copy of supabase/migrations/* + the
-- profiles part of supabase/seed.sql (DEMO KUDOS block intentionally excluded).
-- The migrations remain the source of truth; regenerate if they change.
-- ============================================================================

-- ===================== migration: create_kudos_tables =====================
-- ============================================================
-- profiles: app-wide directory (NOT kudos-scoped)
-- auth_user_id is nullable — non-logged-in employees are valid recipients
-- ============================================================
create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  email         text unique not null,
  display_name  text not null,
  avatar_url    text,
  dept_code     text,
  is_active     boolean not null default true,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index idx_profiles_email        on public.profiles(email);

alter table public.profiles enable row level security;

-- ============================================================
-- kudos
-- sender_profile_id / recipient_profile_id: RESTRICT (no ON DELETE) — preserve history
-- ============================================================
create table public.kudos (
  id                   uuid primary key default gen_random_uuid(),
  sender_profile_id    uuid not null references public.profiles(id),
  recipient_profile_id uuid not null references public.profiles(id),
  title                text not null,
  body_html            text not null,
  hashtags             text[] not null default '{}',
  image_urls           text[] not null default '{}',
  mention_profile_ids  uuid[] not null default '{}',
  is_anonymous         boolean not null default false,
  anonymous_nickname   text,
  status               text not null default 'active',
  metadata             jsonb not null default '{}',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

create index kudos_recipient_idx on public.kudos(recipient_profile_id);
create index kudos_sender_idx    on public.kudos(sender_profile_id);
create index kudos_created_idx   on public.kudos(created_at desc) where deleted_at is null;
create index kudos_hashtags_gin  on public.kudos using gin(hashtags);
create index kudos_mentions_gin  on public.kudos using gin(mention_profile_ids);

alter table public.kudos enable row level security;

-- ============================================================
-- kudo_reactions
-- reaction_type default 'heart'; 3-col unique enables future reaction types
-- ============================================================
create table public.kudo_reactions (
  id              uuid primary key default gen_random_uuid(),
  kudo_id         uuid not null references public.kudos(id) on delete cascade,
  reactor_auth_id uuid not null references auth.users(id) on delete cascade,
  reaction_type   text not null default 'heart',
  created_at      timestamptz not null default now(),
  unique (kudo_id, reactor_auth_id, reaction_type)
);

create index kudo_reactions_kudo_idx on public.kudo_reactions(kudo_id);

alter table public.kudo_reactions enable row level security;

-- ============================================================
-- updated_at auto-touch trigger (profiles + kudos)
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger kudos_updated_at
  before update on public.kudos
  for each row execute function public.touch_updated_at();

-- ===================== migration: create_kudos_storage =====================
-- ============================================================
-- kudo-images storage bucket
-- public = true enables unauthenticated read of public URLs.
-- file_size_limit + allowed_mime_types enforce the 5 MB / image-only rule at
-- the Storage layer too — the client checks in storage.ts can be bypassed by a
-- direct Storage API call, so the server-side guard is authoritative.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kudo-images', 'kudo-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- ===================== migration: create_kudos_policies =====================
-- ============================================================
-- TABLE RLS POLICIES
-- CRITICAL: every auth.uid() call is wrapped in (select ...)
-- so PostgREST evaluates the subquery ONCE per statement, not per row.
-- Reads are restricted to `authenticated` — the kudos directory/feed is
-- behind login; the anon (publishable) key must not reach this data.
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
-- Authenticated users can read the profile directory (recipient/@mention picker).
create policy "profiles: authenticated select"
  on public.profiles for select
  to authenticated
  using (true);

-- A user may only update their OWN already-linked profile row. First-login
-- linking (auth_user_id null → uid) is handled by link_profile_on_login() below,
-- a security-definer RPC, so it does NOT need a permissive update policy here.
create policy "profiles: self update"
  on public.profiles for update
  to authenticated
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

-- ── kudos ─────────────────────────────────────────────────────
-- Feed: authenticated users see all active kudos
-- (deleted / hidden kudos are excluded by the kudos_feed view, not here).
create policy "kudos: authenticated select"
  on public.kudos for select
  to authenticated
  using (true);

-- Insert: caller must be the sender.
-- Subquery is (select ...) so it runs once per INSERT statement.
create policy "kudos: sender insert"
  on public.kudos for insert
  to authenticated
  with check (
    sender_profile_id = (
      select id from public.profiles
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );

-- Update: sender-only, edit-ready for future updateKudo action.
-- Both USING and WITH CHECK enforce sender = caller.
create policy "kudos: sender update"
  on public.kudos for update
  to authenticated
  using (
    sender_profile_id = (
      select id from public.profiles
      where auth_user_id = (select auth.uid())
      limit 1
    )
  )
  with check (
    sender_profile_id = (
      select id from public.profiles
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );

-- ── kudo_reactions ─────────────────────────────────────────────
create policy "reactions: authenticated select"
  on public.kudo_reactions for select
  to authenticated
  using (true);

create policy "reactions: own insert"
  on public.kudo_reactions for insert
  to authenticated
  with check (reactor_auth_id = (select auth.uid()));

create policy "reactions: own delete"
  on public.kudo_reactions for delete
  to authenticated
  using (reactor_auth_id = (select auth.uid()));

-- ============================================================
-- STORAGE RLS POLICIES (on storage.objects)
-- ============================================================

-- Public read — bucket is already public=true; this policy makes it explicit.
create policy "kudo-images: public read"
  on storage.objects for select
  using (bucket_id = 'kudo-images');

-- Authenticated upload, restricted to the caller's OWN {uid}/ folder so a user
-- cannot write objects under another user's path prefix.
create policy "kudo-images: authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'kudo-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Owner delete: path must start with the caller's uid folder ({uid}/...).
create policy "kudo-images: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'kudo-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- Profile self-link RPC (security definer)
-- Lets a freshly-authed user claim THEIR OWN profile row — matched by their
-- verified JWT email — when it has no auth_user_id yet. SECURITY DEFINER so it
-- updates past the restrictive "self update" policy, but it is safe: it only
-- ever touches the row whose email == the caller's authenticated email.
-- ============================================================
create or replace function public.link_profile_on_login()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set auth_user_id = (select auth.uid())
  where email = (select auth.email())
    and auth_user_id is null;
$$;

revoke all on function public.link_profile_on_login() from public, anon;
grant execute on function public.link_profile_on_login() to authenticated;

-- ===================== migration: create_kudos_views =====================
-- ============================================================
-- profile_hero_tier view  (defined first — kudos_feed joins it)
-- Tier thresholds MUST mirror tiers.ts heroTierFor():
--   <= 4  → new
--   <= 9  → rising
--   <= 20 → super
--   > 20  → legend
-- Filters kudos to non-deleted + active only (same criteria as kudos_feed).
-- security invoker (default) — caller's RLS applies.
-- ============================================================
create or replace view public.profile_hero_tier
  with (security_invoker = true)
as
select
  p.id,
  p.display_name,
  p.avatar_url,
  p.dept_code,
  p.email,
  count(k.id)::int as received_kudos_count,
  case
    when count(k.id) <= 4  then 'new'
    when count(k.id) <= 9  then 'rising'
    when count(k.id) <= 20 then 'super'
    else 'legend'
  end              as hero_tier
from public.profiles p
left join public.kudos k
  on  k.recipient_profile_id = p.id
  and k.deleted_at is null
  and k.status = 'active'
group by p.id;

-- ============================================================
-- kudos_feed view
-- - Joins kudos → sender profile + recipient profile
-- - Aggregates reaction_count via LEFT JOIN on kudo_reactions
-- - Anonymous-safe: BOTH the sender display fields AND sender_profile_id are
--   NULL when is_anonymous=true, so the real sender identity (and any id that
--   could be joined back to profiles) never leaves the DB layer.
-- - recipient_hero_tier comes from the profile_hero_tier view (single source
--   of the tier CASE — no correlated per-row subquery).
-- - Filters: deleted_at is null AND status = 'active'
-- - security invoker (Supabase/Postgres default) — caller's RLS applies.
-- ============================================================
create or replace view public.kudos_feed
  with (security_invoker = true)
as
select
  k.id,
  -- Mask the sender id on anonymous kudos (profiles is readable → would
  -- otherwise allow trivial deanonymization via a profiles lookup).
  case when k.is_anonymous then null else k.sender_profile_id end as sender_profile_id,
  k.recipient_profile_id,
  k.title,
  k.body_html,
  k.hashtags,
  k.image_urls,
  k.mention_profile_ids,
  k.is_anonymous,
  k.anonymous_nickname,
  k.status,
  k.metadata,
  k.created_at,
  k.updated_at,

  -- Sender display fields: masked when anonymous
  case when k.is_anonymous then null else p_sender.display_name end  as sender_display_name,
  case when k.is_anonymous then null else p_sender.avatar_url  end   as sender_avatar_url,
  case when k.is_anonymous then null else p_sender.dept_code   end   as sender_dept_code,

  -- Recipient display fields: always exposed
  p_recip.display_name  as recipient_display_name,
  p_recip.avatar_url    as recipient_avatar_url,
  p_recip.dept_code     as recipient_dept_code,

  -- Reaction aggregate
  count(r.id)::int      as reaction_count,

  -- Recipient hero tier (from profile_hero_tier — single source of truth)
  pht.hero_tier         as recipient_hero_tier

from public.kudos k
join public.profiles p_sender on p_sender.id = k.sender_profile_id
join public.profiles p_recip  on p_recip.id  = k.recipient_profile_id
left join public.profile_hero_tier pht on pht.id = k.recipient_profile_id
left join public.kudo_reactions r on r.kudo_id = k.id
where k.deleted_at is null
  and k.status = 'active'
group by
  k.id,
  p_sender.id,
  p_recip.id,
  pht.hero_tier;

-- ============================================================
-- Grants
-- ============================================================
grant select on public.kudos_feed        to authenticated;
grant select on public.profile_hero_tier to authenticated;

-- ===================== profile directory (no demo kudos) =====================
-- ============================================================
-- Sun* Kudos — profile directory seed
--
-- Profiles are the app-wide person directory: any row here is a selectable
-- Kudos recipient and @mention target. Recipients do NOT need to log in.
-- A profile becomes a *sender* when someone logs in with a matching email —
-- link_profile_on_login() then sets its auth_user_id (see policies migration).
--
-- IDEMPOTENT: `on conflict (email) do nothing` — safe to run repeatedly.
--
-- LOCAL: applied automatically by `npx supabase db reset`.
-- PROD (after deploy + migrations):
--   • Supabase Studio → SQL Editor → paste this file → Run, OR
--   • psql "$SUPABASE_DB_URL" -f supabase/seed.sql
--   Before prod, replace the sample rows below with the real Sun* roster
--   (keep the same columns). Real avatars/dept_codes optional.
-- ============================================================

insert into public.profiles (email, display_name, avatar_url, dept_code, is_active)
values
  -- You — so you can log in and SEND kudos (email must match your Google login).
  ('huynh.van.quoi@sun-asterisk.com', 'Huỳnh Văn Quới', 'https://i.pravatar.cc/150?u=huynh.van.quoi', 'ENG', true),

  -- Engineering
  ('minh.nguyen@sun-asterisk.com',   'Nguyễn Minh',      null,                                         'ENG',       true),
  ('hung.pham@sun-asterisk.com',     'Phạm Hùng',        'https://i.pravatar.cc/150?u=hung.pham',      'ENG',       true),
  ('tuan.vo@sun-asterisk.com',       'Võ Tuấn',          null,                                         'ENG',       true),
  ('nam.bui@sun-asterisk.com',       'Bùi Nam',          'https://i.pravatar.cc/150?u=nam.bui',        'ENG',       true),
  ('khoa.trinh@sun-asterisk.com',    'Trịnh Khoa',       null,                                         'ENG',       true),
  ('son.dinh@sun-asterisk.com',      'Đinh Sơn',         'https://i.pravatar.cc/150?u=son.dinh',       'ENG',       true),

  -- Product / Project Management
  ('linh.tran@sun-asterisk.com',     'Trần Thị Linh',    'https://i.pravatar.cc/150?u=linh.tran',      'PM',        true),
  ('phuong.ngo@sun-asterisk.com',    'Ngô Phương',       'https://i.pravatar.cc/150?u=phuong.ngo',     'PM',        true),
  ('quan.ly@sun-asterisk.com',       'Lý Quân',          null,                                         'PM',        true),

  -- Design
  ('mai.le@sun-asterisk.com',        'Lê Thị Mai',       'https://i.pravatar.cc/150?u=mai.le',         'DESIGN',    true),
  ('lan.phan@sun-asterisk.com',      'Phan Thị Lan',     'https://i.pravatar.cc/150?u=lan.phan',       'DESIGN',    true),
  ('duc.cao@sun-asterisk.com',       'Cao Đức',          null,                                         'DESIGN',    true),

  -- QA
  ('hoa.do@sun-asterisk.com',        'Đỗ Thị Hoa',       'https://i.pravatar.cc/150?u=hoa.do',         'QA',        true),
  ('an.vu@sun-asterisk.com',         'Vũ An',            null,                                         'QA',        true),

  -- DevOps
  ('long.dang@sun-asterisk.com',     'Đặng Long',        null,                                         'DEVOPS',    true),
  ('kien.ho@sun-asterisk.com',       'Hồ Kiên',          'https://i.pravatar.cc/150?u=kien.ho',        'DEVOPS',    true),

  -- HR / People
  ('thu.hoang@sun-asterisk.com',     'Hoàng Thu',        'https://i.pravatar.cc/150?u=thu.hoang',      'HR',        true),
  ('ngoc.duong@sun-asterisk.com',    'Dương Ngọc',       null,                                         'HR',        true),

  -- Business / Marketing
  ('huy.truong@sun-asterisk.com',    'Trương Huy',       'https://i.pravatar.cc/150?u=huy.truong',     'BA',        true),
  ('chi.dao@sun-asterisk.com',       'Đào Chi',          null,                                         'MARKETING', true)
on conflict (email) do nothing;

-- ===================== link existing auth users to their profile ====================
-- Matches profiles to already-created auth.users by email (idempotent).
update public.profiles p
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email) and p.auth_user_id is null;
