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
