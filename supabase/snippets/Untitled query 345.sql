insert into public.kudos (sender_profile_id, recipient_profile_id, title, body_html, status)
select s.id, r.id, 'Test', '<p>hi</p>', 'active'
from (select id from public.profiles limit 1) s,
     (select id from public.profiles offset 1 limit 1) r;
