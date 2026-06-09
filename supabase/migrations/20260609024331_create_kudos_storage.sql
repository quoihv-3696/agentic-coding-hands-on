-- ============================================================
-- kudo-images storage bucket
-- public = true enables unauthenticated read of public URLs.
-- file_size_limit + allowed_mime_types enforce the 5 MB / image-only rule at
-- the Storage layer too — the client checks in storage.ts can be bypassed by a
-- direct Storage API call, so the server-side guard is authoritative.
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kudo-images', 'kudo-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
