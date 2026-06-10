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

-- ============================================================
-- Backfill canonical `department` (Live Board "Phòng ban" filter) from the
-- finer dept_code. Mapping is demo-only — real roster carries its own values.
-- ============================================================
update public.profiles set department = case dept_code
  when 'ENG'       then 'CEVC1'
  when 'PM'        then 'CEVC2'
  when 'DESIGN'    then 'CEVC3'
  when 'QA'        then 'CEVC4'
  when 'DEVOPS'    then 'Infra'
  when 'HR'        then 'OPD'
  when 'BA'        then 'OPD'
  when 'MARKETING' then 'OPD'
  else department
end
where department is null;

-- ============================================================
-- Special day (×2 hearts) — seed TODAY (Asia/Ho_Chi_Minh) so the special-day
-- heart path is testable locally. Remove / adjust for prod.
-- ============================================================
insert into public.special_days (event_date, multiplier, label)
values ((now() at time zone 'Asia/Ho_Chi_Minh')::date, 2, 'Demo special day')
on conflict (event_date) do nothing;

-- ============================================================
-- DEMO KUDOS (local / testing) — sample messages exchanged between the
-- profiles above so the /kudos feed and Hero tiers are populated.
--
-- • Idempotent: fixed UUID ids + `on conflict (id) do nothing`.
-- • Resilient: the JOINs resolve sender/recipient by email, so any row whose
--   profile is missing is simply skipped (no error).
-- • Reaction (❤️) counts are NOT seeded — kudo_reactions references auth.users
--   and seeded profiles have no auth user. Hero tiers still appear because they
--   derive from received-kudo count (Nguyễn Minh receives 5 → "Rising Hero").
--
-- PROD: this is demo content — DELETE this whole block before importing to prod
-- (real kudos will be written by users), or keep it if you want seeded examples.
-- ============================================================
insert into public.kudos
  (id, sender_profile_id, recipient_profile_id, title, body_html, hashtags, is_anonymous, anonymous_nickname, created_at)
select
  v.id, s.id, r.id, v.title, v.body_html, v.hashtags, v.is_anonymous, v.nickname, now() - v.age
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'huynh.van.quoi@sun-asterisk.com', 'minh.nguyen@sun-asterisk.com', 'Người gánh team thầm lặng',        '<p>Cảm ơn Minh đã <strong>thức đêm fix bug</strong> giúp cả team kịp deadline. Bạn là chỗ dựa của tụi mình!</p>',                 array['be-a-team','high-performing'],        false, null,            interval '1 hour'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'minh.nguyen@sun-asterisk.com', 'huynh.van.quoi@sun-asterisk.com', 'Mentor tận tâm',                   '<p>Quới review code rất kỹ và luôn chỉ mình những chỗ làm tốt hơn. <em>Học được nhiều lắm!</em></p>',                              array['be-professional'],                    false, null,            interval '3 hours'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'linh.tran@sun-asterisk.com', 'minh.nguyen@sun-asterisk.com', 'Cứu tinh của sprint',              '<p>Nhờ Minh hỗ trợ mà release suôn sẻ. Quá xịn 👏</p>',                                                                            array['go-fast','be-a-team'],                false, null,            interval '6 hours'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'hung.pham@sun-asterisk.com', 'minh.nguyen@sun-asterisk.com', 'Luôn sẵn sàng giúp đỡ',            '<p>Hỏi gì Minh cũng nhiệt tình trả lời. Cảm ơn đồng đội!</p>',                                                                     array['be-optimistic'],                      false, null,            interval '10 hours'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'mai.le@sun-asterisk.com', 'minh.nguyen@sun-asterisk.com', 'Tinh thần Wasshoi',                '<p>Năng lượng của Minh truyền cảm hứng cho cả phòng. <strong>Wasshoi!</strong></p>',                                               array['wasshoi'],                            false, null,            interval '1 day'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'tuan.vo@sun-asterisk.com', 'minh.nguyen@sun-asterisk.com', 'Chất lượng code tuyệt vời',        '<p>PR của Minh lúc nào cũng sạch và dễ đọc. Chuẩn mực luôn!</p>',                                                                  array['be-professional','high-performing'],  false, null,            interval '2 days'),
  ('a0000000-0000-4000-8000-000000000007'::uuid, 'minh.nguyen@sun-asterisk.com', 'linh.tran@sun-asterisk.com', 'PM tâm lý nhất team',              '<p>Chị Linh luôn lắng nghe và sắp xếp công việc hợp lý. Làm việc với chị rất thoải mái.</p>',                                       array['be-a-team'],                          false, null,            interval '1 day 4 hours'),
  ('a0000000-0000-4000-8000-000000000008'::uuid, 'huynh.van.quoi@sun-asterisk.com', 'linh.tran@sun-asterisk.com', 'Giữ lửa cho cả nhóm',             '<p>Cảm ơn chị Linh đã luôn động viên tụi em những lúc khó khăn nhất ❤️</p>',                                                        array['be-optimistic','be-a-team'],          false, null,            interval '2 days 2 hours'),
  ('a0000000-0000-4000-8000-000000000009'::uuid, 'hung.pham@sun-asterisk.com', 'linh.tran@sun-asterisk.com', 'Quản lý dự án xuất sắc',           '<p>Dự án về đích đúng hạn là nhờ sự điều phối của chị. <em>Cảm ơn chị nhiều!</em></p>',                                            array['high-performing'],                    false, null,            interval '3 days'),
  ('a0000000-0000-4000-8000-00000000000a'::uuid, 'linh.tran@sun-asterisk.com', 'hung.pham@sun-asterisk.com', 'Dev chủ lực',                      '<p>Hùng nhận task khó nào cũng chiến hết mình. <strong>Get risky</strong> đúng nghĩa!</p>',                                        array['get-risky','high-performing'],        false, null,            interval '3 days 5 hours'),
  ('a0000000-0000-4000-8000-00000000000b'::uuid, 'hoa.do@sun-asterisk.com', 'hung.pham@sun-asterisk.com', 'Fix bug thần tốc',                 '<p>Báo bug buổi sáng, chiều đã có fix. Tốc độ đáng nể!</p>',                                                                       array['go-fast'],                            false, null,            interval '4 days'),
  ('a0000000-0000-4000-8000-00000000000c'::uuid, 'thu.hoang@sun-asterisk.com', 'mai.le@sun-asterisk.com', 'Thiết kế có gu',                   '<p>UI bạn làm vừa đẹp vừa dễ dùng. Khách hàng khen hết lời!</p>',                                                                  array['think-outside-the-box'],              true,  'Một người thầm lặng', interval '4 days 8 hours'),
  ('a0000000-0000-4000-8000-00000000000d'::uuid, 'long.dang@sun-asterisk.com', 'mai.le@sun-asterisk.com', 'Phối hợp ăn ý',                    '<p>Làm việc với Mai cực kỳ smooth, design hand-off rõ ràng chi tiết.</p>',                                                         array['be-a-team','be-professional'],        false, null,            interval '5 days'),
  ('a0000000-0000-4000-8000-00000000000e'::uuid, 'mai.le@sun-asterisk.com', 'huynh.van.quoi@sun-asterisk.com', 'Cảm ơn anh đã hỗ trợ',             '<p>Anh Quới giúp em dựng môi trường dev nhanh gọn. Biết ơn ạ!</p>',                                                                array['be-optimistic'],                      false, null,            interval '5 days 6 hours'),
  ('a0000000-0000-4000-8000-00000000000f'::uuid, 'nam.bui@sun-asterisk.com', 'huynh.van.quoi@sun-asterisk.com', 'Tư duy giải pháp',                '<p>Mỗi lần bí, hỏi anh Quới là có hướng đi mới. <em>Think outside the box!</em></p>',                                              array['think-outside-the-box','get-risky'],  false, null,            interval '6 days'),
  ('a0000000-0000-4000-8000-000000000010'::uuid, 'phuong.ngo@sun-asterisk.com', 'tuan.vo@sun-asterisk.com', 'Đồng đội đáng tin',                '<p>Tuấn luôn hoàn thành phần việc của mình chỉn chu, đỡ cả team rất nhiều.</p>',                                                   array['be-a-team'],                          true,  'Đồng nghiệp ẩn danh',  interval '7 days')
) as v(id, sender_email, recip_email, title, body_html, hashtags, is_anonymous, nickname, age)
join public.profiles s on s.email = v.sender_email
join public.profiles r on r.email = v.recip_email
on conflict (id) do nothing;

-- Attach free placeholder photos to a few demo kudos so the image strip shows.
-- Lorem Picsum (picsum.photos): free, no API key, hotlink-friendly, stable per
-- seed. Rendered via next/image `unoptimized`, so no next.config domain needed.
-- Idempotent: plain UPDATEs keyed by the fixed kudo ids above.
update public.kudos set image_urls = array[
  'https://picsum.photos/seed/saa-kudo-1a/640/420',
  'https://picsum.photos/seed/saa-kudo-1b/640/420'
] where id = 'a0000000-0000-4000-8000-000000000001';

update public.kudos set image_urls = array[
  'https://picsum.photos/seed/saa-kudo-5a/640/420',
  'https://picsum.photos/seed/saa-kudo-5b/640/420',
  'https://picsum.photos/seed/saa-kudo-5c/640/420'
] where id = 'a0000000-0000-4000-8000-000000000005';

update public.kudos set image_urls = array[
  'https://picsum.photos/seed/saa-kudo-a/640/420'
] where id = 'a0000000-0000-4000-8000-00000000000a';

update public.kudos set image_urls = array[
  'https://picsum.photos/seed/saa-kudo-c1/640/420',
  'https://picsum.photos/seed/saa-kudo-c2/640/420'
] where id = 'a0000000-0000-4000-8000-00000000000c';
