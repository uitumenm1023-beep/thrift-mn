-- =====================================================================
-- Thrift.mn — 0003: Storage buckets and policies
-- Files are stored as  <bucket>/<user_id>/<random-name>.webp
-- Users may only write inside their own <user_id>/ folder.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('shop-images', 'shop-images', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets serve files through their public URL without a policy.
-- These policies control uploading, replacing and deleting.

drop policy if exists "thrift: upload to own folder" on storage.objects;
create policy "thrift: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('product-images', 'shop-images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "thrift: read own folder" on storage.objects;
create policy "thrift: read own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('product-images', 'shop-images')
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
  );

drop policy if exists "thrift: update own folder" on storage.objects;
create policy "thrift: update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('product-images', 'shop-images')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "thrift: delete own folder or admin" on storage.objects;
create policy "thrift: delete own folder or admin" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('product-images', 'shop-images')
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
  );
