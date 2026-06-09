-- ============================================================================
-- prod-demo-content.sql — seed DEMO kudos + heart reactions (paste into SQL Editor → Run)
--
-- Uses the 20 seeded mock profiles as BOTH senders and reactors.
-- Run AFTER prod-setup.sql (schema + profiles must exist).
--
-- WHY step A: kudo_reactions.reactor_auth_id references auth.users, but seeded
-- profiles have auth_user_id = NULL. So we first give each unlinked profile an
-- inert auth user (by its own email, no password → can't log in) and link it.
-- Now the mock people can own reactions — no throwaway "bot" accounts.
--
-- IDEMPOTENT: re-running won't duplicate. CLEANUP block at the bottom.
-- ============================================================================

-- ── A. Make the mock profiles into valid reactors ───────────────────────────
-- A1: create an auth user for every profile that has none yet (by email).
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  p.email, '', now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}',
  '', '', '', ''
from public.profiles p
where p.auth_user_id is null
  and not exists (select 1 from auth.users u where lower(u.email) = lower(p.email));

-- A2: link every profile to its auth user (idempotent; the real Gmail stays as-is).
update public.profiles p
set auth_user_id = u.id
from auth.users u
where lower(u.email) = lower(p.email) and p.auth_user_id is null;

-- ── B. Demo kudos (senders/recipients = mock profiles, resolved by email) ────
insert into public.kudos
  (id, sender_profile_id, recipient_profile_id, title, body_html, hashtags, image_urls, is_anonymous, anonymous_nickname, created_at)
select
  v.id, s.id, r.id, v.title, v.body_html, v.hashtags, v.image_urls, v.is_anonymous, v.nickname, now() - v.age
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, 'minh.nguyen@sun-asterisk.com', 'huynh.van.quoi@sun-asterisk.com', 'Mentor tận tâm',          '<p>Cảm ơn anh Quới đã <strong>review code</strong> và hướng dẫn em rất kỹ. Học được nhiều lắm!</p>',                array['be-professional'],                    array['https://picsum.photos/seed/saa-p1/640/420']::text[], false, null,                  interval '2 hours'),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 'linh.tran@sun-asterisk.com',   'minh.nguyen@sun-asterisk.com',   'Cứu tinh của sprint',     '<p>Nhờ Minh thức đêm fix bug mà release kịp deadline. <em>Quá xịn!</em> 👏</p>',                                    array['be-a-team','high-performing'],        '{}'::text[],                                              false, null,                  interval '5 hours'),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 'huynh.van.quoi@sun-asterisk.com','mai.le@sun-asterisk.com',       'Thiết kế có gu',          '<p>UI Mai làm vừa đẹp vừa dễ dùng, khách hàng khen hết lời. <strong>Think outside the box!</strong></p>',          array['think-outside-the-box'],              array['https://picsum.photos/seed/saa-p3a/640/420','https://picsum.photos/seed/saa-p3b/640/420']::text[], false, null, interval '8 hours'),
  ('b0000000-0000-4000-8000-000000000004'::uuid, 'hung.pham@sun-asterisk.com',   'linh.tran@sun-asterisk.com',     'PM tâm lý nhất team',     '<p>Chị Linh luôn lắng nghe và sắp xếp công việc hợp lý. Làm việc với chị rất thoải mái.</p>',                       array['be-a-team'],                          '{}'::text[],                                              false, null,                  interval '1 day'),
  ('b0000000-0000-4000-8000-000000000005'::uuid, 'mai.le@sun-asterisk.com',      'tuan.vo@sun-asterisk.com',       'Đồng đội đáng tin',       '<p>Tuấn luôn hoàn thành phần việc chỉn chu, đỡ cả team rất nhiều. Cảm ơn nhé!</p>',                                 array['be-optimistic'],                      '{}'::text[],                                              true,  'Một người thầm lặng', interval '1 day 6 hours'),
  ('b0000000-0000-4000-8000-000000000006'::uuid, 'hoa.do@sun-asterisk.com',      'hung.pham@sun-asterisk.com',     'Fix bug thần tốc',        '<p>Báo bug buổi sáng, chiều đã có fix. Tốc độ đáng nể! <strong>Go fast</strong> 🚀</p>',                            array['go-fast'],                            array['https://picsum.photos/seed/saa-p6/640/420']::text[], false, null,                  interval '2 days'),
  ('b0000000-0000-4000-8000-000000000007'::uuid, 'tuan.vo@sun-asterisk.com',     'huynh.van.quoi@sun-asterisk.com','Tư duy giải pháp',        '<p>Mỗi lần bí, hỏi anh Quới là có hướng đi mới. Cảm ơn anh!</p>',                                                  array['get-risky'],                          '{}'::text[],                                              false, null,                  interval '3 days'),
  ('b0000000-0000-4000-8000-000000000008'::uuid, 'phuong.ngo@sun-asterisk.com',  'minh.nguyen@sun-asterisk.com',   'Tinh thần Wasshoi',       '<p>Năng lượng của Minh truyền cảm hứng cho cả phòng. <strong>Wasshoi!</strong> 🎉</p>',                             array['wasshoi','be-optimistic'],            '{}'::text[],                                              false, null,                  interval '4 days')
) as v(id, sender_email, recip_email, title, body_html, hashtags, image_urls, is_anonymous, nickname, age)
join public.profiles s on s.email = v.sender_email
join public.profiles r on r.email = v.recip_email
on conflict (id) do nothing;

-- ── C. Heart reactions — reactors ARE the mock profiles (varied counts) ──────
-- Reactor pool = all profiles that aren't the kudo's own recipient (so the count
-- looks natural). Each kudo gets N hearts; shows the "5 ❤️ = 1 Secret Box" idea.
insert into public.kudo_reactions (kudo_id, reactor_auth_id, reaction_type)
select k.id, sub.auth_user_id, 'heart'
from (values
  ('b0000000-0000-4000-8000-000000000001'::uuid, 7),
  ('b0000000-0000-4000-8000-000000000002'::uuid, 6),
  ('b0000000-0000-4000-8000-000000000003'::uuid, 5),
  ('b0000000-0000-4000-8000-000000000004'::uuid, 4),
  ('b0000000-0000-4000-8000-000000000005'::uuid, 3),
  ('b0000000-0000-4000-8000-000000000006'::uuid, 2),
  ('b0000000-0000-4000-8000-000000000007'::uuid, 1),
  ('b0000000-0000-4000-8000-000000000008'::uuid, 8)
) as k(id, n)
join public.kudos ku on ku.id = k.id
join lateral (
  select p.auth_user_id
  from public.profiles p
  where p.auth_user_id is not null
    and p.id <> ku.recipient_profile_id   -- don't let the recipient heart their own kudo
  order by p.email
  limit k.n
) as sub on true
on conflict (kudo_id, reactor_auth_id, reaction_type) do nothing;

-- ── Verify (optional) ────────────────────────────────────────────────────────
-- select title, reaction_count from public.kudos_feed
-- where id::text like 'b0000000-%' order by reaction_count desc;

-- ============================================================================
-- CLEANUP (uncomment + run to remove the demo kudos + their reactions):
--   delete from public.kudo_reactions where kudo_id::text like 'b0000000-%';
--   delete from public.kudos where id::text like 'b0000000-%';
-- The auth users created in step A are the mock roster (kept so they remain valid
-- senders/recipients). To FULLY revert them too (unlinks profiles):
--   update public.profiles set auth_user_id = null
--     where email <> 'huynh.van.quoi@sun-asterisk.com';
--   delete from auth.users
--     where email <> 'huynh.van.quoi@sun-asterisk.com'
--       and email like '%@sun-asterisk.com';
-- ============================================================================
