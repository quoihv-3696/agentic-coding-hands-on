-- ============================================================
-- kudo-images storage bucket
-- public = true enables unauthenticated read of public URLs
-- ============================================================
insert into storage.buckets (id, name, public)
values ('kudo-images', 'kudo-images', true);
