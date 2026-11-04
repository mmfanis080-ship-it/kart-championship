-- Run this ONCE in the Supabase SQL Editor. Safe on an existing project.

-- 1) Races (calendar): round, name, track, date
create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  round int not null unique check (round > 0),
  name text not null,
  track text,
  race_date date
);
alter table public.races add column if not exists track text;
alter table public.races add column if not exists race_date date;
alter table public.races alter column track drop not null;
alter table public.races alter column race_date drop not null;
alter table public.races enable row level security;

-- 2) Admin check (only needed for the results table policies)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins a where a.user_id = auth.uid()); $$;

-- 3) Results per race
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  race_id uuid not null references public.races(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  position int not null check (position > 0),
  points int not null default 0 check (points >= 0),
  unique (race_id, driver_id)
);
alter table public.results enable row level security;
drop policy if exists "results_public_read" on public.results;
drop policy if exists "results_admin_insert" on public.results;
drop policy if exists "results_admin_update" on public.results;
drop policy if exists "results_admin_delete" on public.results;
create policy "results_public_read" on public.results for select using (true);
create policy "results_admin_insert" on public.results for insert with check (public.is_admin());
create policy "results_admin_update" on public.results for update using (public.is_admin()) with check (public.is_admin());
create policy "results_admin_delete" on public.results for delete using (public.is_admin());

-- 4) Make yourself admin (replace the email with the one you log in with):
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR_EMAIL' on conflict do nothing;

-- Races policies
drop policy if exists "races_public_read" on public.races;
drop policy if exists "races_admin_insert" on public.races;
drop policy if exists "races_admin_update" on public.races;
drop policy if exists "races_admin_delete" on public.races;
create policy "races_public_read" on public.races for select using (true);
create policy "races_admin_insert" on public.races for insert with check (public.is_admin());
create policy "races_admin_update" on public.races for update using (public.is_admin()) with check (public.is_admin());
create policy "races_admin_delete" on public.races for delete using (public.is_admin());
