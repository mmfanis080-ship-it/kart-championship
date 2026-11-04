-- Run this ONCE in the Supabase SQL Editor (before deploying the new code).

-- 1) Photo column for drivers
alter table public.drivers add column if not exists photo_url text;

-- 2) Public storage bucket for driver photos
insert into storage.buckets (id, name, public)
values ('driver-photos', 'driver-photos', true)
on conflict (id) do nothing;

-- 3) Everyone can view, only admins can upload / change / delete
drop policy if exists "driver_photos_public_read" on storage.objects;
drop policy if exists "driver_photos_admin_insert" on storage.objects;
drop policy if exists "driver_photos_admin_update" on storage.objects;
drop policy if exists "driver_photos_admin_delete" on storage.objects;
create policy "driver_photos_public_read" on storage.objects for select
  using (bucket_id = 'driver-photos');
create policy "driver_photos_admin_insert" on storage.objects for insert
  with check (bucket_id = 'driver-photos' and public.is_admin());
create policy "driver_photos_admin_update" on storage.objects for update
  using (bucket_id = 'driver-photos' and public.is_admin())
  with check (bucket_id = 'driver-photos' and public.is_admin());
create policy "driver_photos_admin_delete" on storage.objects for delete
  using (bucket_id = 'driver-photos' and public.is_admin());
