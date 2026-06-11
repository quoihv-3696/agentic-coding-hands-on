-- ============================================================
-- Security-advisor hardening (Supabase linter)
--
-- 1) public.touch_updated_at — pin a stable search_path (was mutable). It only
--    calls now() (pg_catalog, always implicitly in path), so '' is safe.
-- 2) Drop the broad "kudo-images: public read" SELECT policy on storage.objects.
--    The bucket is public=true, so object URLs (getPublicUrl) resolve WITHOUT a
--    SELECT policy; the policy only added the ability to LIST every file. Upload
--    (own folder) + owner-delete policies are unaffected.
-- 3) public.link_profile_on_login — pin search_path to '' (all refs already
--    schema-qualified). It STAYS a SECURITY DEFINER RPC callable by authenticated
--    BY DESIGN: first-login profile claim, no parameters, scoped to the caller's
--    own row (email = auth.email() AND auth_user_id IS NULL). DEFINER is required
--    to update past the restrictive "profiles: self update" policy and is more
--    restrictive than granting a permissive update policy would be.
-- ============================================================

-- 1) ──────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) ──────────────────────────────────────────────────────────
drop policy if exists "kudo-images: public read" on storage.objects;

-- 3) ──────────────────────────────────────────────────────────
create or replace function public.link_profile_on_login()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set auth_user_id = (select auth.uid())
  where email = (select auth.email())
    and auth_user_id is null;
$$;

revoke all on function public.link_profile_on_login() from public, anon;
grant execute on function public.link_profile_on_login() to authenticated;
