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
