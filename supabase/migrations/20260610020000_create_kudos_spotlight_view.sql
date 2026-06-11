-- ============================================================
-- kudos_spotlight_recipients view
-- One row per recipient who has at least one active kudo.
-- Fields used by the Spotlight Board word-cloud layout:
--   recipient_profile_id, display_name, dept_code, avatar_url,
--   kudos_count       — weight that drives font-size / node size
--   latest_kudo_id    — href target when user clicks the node
--   latest_kudo_at    — tooltip timestamp
--
-- Implementation note:
-- Uses DISTINCT ON (recipient_profile_id) with ORDER BY created_at DESC to
-- select the most-recent active kudo per recipient in a single scan, then
-- a correlated count subquery to get the total per-recipient count.  The
-- combined query avoids a self-JOIN aggregation that would require a full
-- GROUP BY recompute for every row.
--
-- Active kudo criteria mirrors the rest of the schema:
--   deleted_at IS NULL AND status = 'active'
--
-- security_invoker = true → caller's RLS applies (authenticated-only via grant).
-- ============================================================
create or replace view public.kudos_spotlight_recipients
  with (security_invoker = true)
as
select
  latest.recipient_profile_id,
  p.display_name,
  p.dept_code,
  p.avatar_url,
  counts.kudos_count,
  latest.id          as latest_kudo_id,
  latest.created_at  as latest_kudo_at
from (
  -- Most-recent active kudo per recipient (deterministic: most-recent created_at,
  -- then id desc as tiebreak so the result is stable when two kudos share a timestamp).
  select distinct on (k.recipient_profile_id)
    k.id,
    k.recipient_profile_id,
    k.created_at
  from public.kudos k
  where k.deleted_at is null
    and k.status = 'active'
  order by k.recipient_profile_id, k.created_at desc, k.id desc
) latest
join public.profiles p on p.id = latest.recipient_profile_id
join (
  -- Per-recipient active kudo count
  select
    recipient_profile_id,
    count(*)::int as kudos_count
  from public.kudos
  where deleted_at is null
    and status = 'active'
  group by recipient_profile_id
) counts on counts.recipient_profile_id = latest.recipient_profile_id;

-- ============================================================
-- Grants
-- ============================================================
grant select on public.kudos_spotlight_recipients to authenticated;
