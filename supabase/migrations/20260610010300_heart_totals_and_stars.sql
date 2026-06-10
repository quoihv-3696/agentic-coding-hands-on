-- ============================================================
-- Heart totals + star counts + feed view recreate
--  • profile_heart_totals: hearts accrued to a profile as the SENDER of kudos
--    (others heart the kudos they sent → sum credits the sender). Powers
--    "Số tim bạn nhận được".
--  • profile_hero_tier: ADD star_count (1★=10 / 2★=20 / 3★=50 received) alongside
--    the unchanged 4-tier hero_tier.
--  • kudos_feed: ADD recipient/sender star_count, sender_hero_tier, and
--    recipient/sender department — sender-side fields masked on anonymous rows.
-- All views security_invoker (caller's RLS applies).
-- ============================================================

-- ── profile_heart_totals ───────────────────────────────────────
create or replace view public.profile_heart_totals
  with (security_invoker = true)
as
select
  p.id,
  coalesce(sum(r.hearts_awarded), 0)::int as hearts_received
from public.profiles p
left join public.kudos k
  on  k.sender_profile_id = p.id
  and k.deleted_at is null
  and k.status = 'active'
left join public.kudo_reactions r
  on r.kudo_id = k.id
group by p.id;

grant select on public.profile_heart_totals to authenticated;

-- ── profile_hero_tier (recreate: add star_count) ────────────────
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
  end as hero_tier,
  case
    when count(k.id) >= 50 then 3
    when count(k.id) >= 20 then 2
    when count(k.id) >= 10 then 1
    else 0
  end::int as star_count
from public.profiles p
left join public.kudos k
  on  k.recipient_profile_id = p.id
  and k.deleted_at is null
  and k.status = 'active'
group by p.id;

-- ── kudos_feed (recreate: + stars, sender tier, departments) ────
-- DROP first: CREATE OR REPLACE VIEW can only APPEND columns, but this recreate
-- inserts new sender columns mid-list and reorders, so Postgres rejects a replace
-- (42P16). No DB object depends on this view, so dropping is safe.
drop view if exists public.kudos_feed;

create view public.kudos_feed
  with (security_invoker = true)
as
select
  k.id,
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
  case when k.is_anonymous then null else p_sender.display_name end as sender_display_name,
  case when k.is_anonymous then null else p_sender.avatar_url  end  as sender_avatar_url,
  case when k.is_anonymous then null else p_sender.dept_code   end  as sender_dept_code,
  case when k.is_anonymous then null else p_sender.department  end  as sender_department,
  case when k.is_anonymous then null else pht_sender.hero_tier end  as sender_hero_tier,
  case when k.is_anonymous then null else pht_sender.star_count end as sender_star_count,

  -- Recipient display fields: always exposed
  p_recip.display_name as recipient_display_name,
  p_recip.avatar_url   as recipient_avatar_url,
  p_recip.dept_code    as recipient_dept_code,
  p_recip.department   as recipient_department,

  -- Reaction aggregate
  count(r.id)::int as reaction_count,

  -- Recipient hero tier + stars (single source: profile_hero_tier)
  pht_recip.hero_tier  as recipient_hero_tier,
  coalesce(pht_recip.star_count, 0) as recipient_star_count

from public.kudos k
join public.profiles p_sender on p_sender.id = k.sender_profile_id
join public.profiles p_recip  on p_recip.id  = k.recipient_profile_id
left join public.profile_hero_tier pht_recip  on pht_recip.id  = k.recipient_profile_id
left join public.profile_hero_tier pht_sender on pht_sender.id = k.sender_profile_id
left join public.kudo_reactions r on r.kudo_id = k.id
where k.deleted_at is null
  and k.status = 'active'
group by
  k.id,
  p_sender.id,
  p_recip.id,
  pht_recip.hero_tier,
  pht_recip.star_count,
  pht_sender.hero_tier,
  pht_sender.star_count;

grant select on public.kudos_feed to authenticated;
