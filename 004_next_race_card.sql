-- Run this ONCE in the Supabase SQL Editor (before deploying the new code).
alter table public.races add column if not exists race_time time;
alter table public.races add column if not exists details text;
alter table public.races add column if not exists track_image_url text;
