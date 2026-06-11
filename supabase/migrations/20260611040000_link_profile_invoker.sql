-- ============================================================
-- Clear the "SECURITY DEFINER callable by authenticated" advisor for
-- link_profile_on_login by switching it to SECURITY INVOKER, and fold the
-- first-login claim into the EXISTING update policy (one permissive UPDATE
-- policy per role/action — avoids the "multiple permissive policies" advisor).
--
-- The function previously needed DEFINER to update past the restrictive
-- "profiles: self update" policy during first-login (auth_user_id still null).
-- The merged policy below grants exactly that one extra capability under the
-- caller's own RLS:
--   USING:      own already-linked row  OR  an unlinked row bearing my JWT email
--   WITH CHECK: the row must end up owned by me (auth_user_id = my uid)
-- → a user can only claim the unlinked row with their own email, set to their uid.
-- ============================================================

create or replace function public.link_profile_on_login()
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.profiles
  set auth_user_id = (select auth.uid())
  where email = (select auth.email())
    and auth_user_id is null;
$$;

-- Grants are preserved across create-or-replace; restate for clarity.
revoke all on function public.link_profile_on_login() from public, anon;
grant execute on function public.link_profile_on_login() to authenticated;

-- Single merged UPDATE policy (replaces "profiles: self update").
drop policy if exists "profiles: self update" on public.profiles;
drop policy if exists "profiles: claim own unlinked row" on public.profiles;
create policy "profiles: update own or claim"
  on public.profiles for update
  to authenticated
  using (
    auth_user_id = (select auth.uid())
    or (auth_user_id is null and email = (select auth.email()))
  )
  with check (auth_user_id = (select auth.uid()));
