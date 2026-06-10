-- ============================================================
-- Self-heart block (spec C.4.1): the sender of a kudo cannot heart their own.
-- Replaces the permissive "reactions: own insert" policy with one that also
-- requires the reactor's profile to differ from the kudo's sender.
-- auth.uid() wrapped in (select ...) so it evaluates once per statement.
-- ============================================================
drop policy if exists "reactions: own insert" on public.kudo_reactions;

create policy "reactions: not self insert"
  on public.kudo_reactions for insert
  to authenticated
  with check (
    reactor_auth_id = (select auth.uid())
    and (
      select k.sender_profile_id from public.kudos k where k.id = kudo_id
    ) is distinct from (
      select id from public.profiles
      where auth_user_id = (select auth.uid())
      limit 1
    )
  );
