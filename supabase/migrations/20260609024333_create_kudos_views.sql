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
