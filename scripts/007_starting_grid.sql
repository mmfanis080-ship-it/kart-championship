-- Run once in Supabase SQL Editor. Does NOT touch standings, ratings, or race results.
-- One public starting grid; only public.admins users can publish or remove it.
create table if not exists public.published_starting_grid (
  id boolean primary key default true check (id),
  driver_ids jsonb not null check (jsonb_typeof(driver_ids) = 'array'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.published_starting_grid enable row level security;
drop policy if exists starting_grid_public_select on public.published_starting_grid;
create policy starting_grid_public_select on public.published_starting_grid
  for select to anon, authenticated using (true);
drop policy if exists starting_grid_admin_insert on public.published_starting_grid;
create policy starting_grid_admin_insert on public.published_starting_grid
  for insert to authenticated with check ((select public.is_admin()));
drop policy if exists starting_grid_admin_update on public.published_starting_grid;
create policy starting_grid_admin_update on public.published_starting_grid
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists starting_grid_admin_delete on public.published_starting_grid;
create policy starting_grid_admin_delete on public.published_starting_grid
  for delete to authenticated using ((select public.is_admin()));
grant select on public.published_starting_grid to anon, authenticated;
grant insert, update, delete on public.published_starting_grid to authenticated;
