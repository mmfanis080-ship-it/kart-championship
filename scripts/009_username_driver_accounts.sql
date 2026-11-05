-- Run AFTER 008_driver_accounts_awards.sql (kart-driver-accounts-awards.sql).
-- Only run via Supabase SQL Editor as the project owner.
-- Does not change standings, points, ratings, results, attendance votes or awards.

create table if not exists public.driver_username_accounts (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint driver_username_valid check (username ~ '^[a-z][a-z0-9_]{2,23}$')
);
alter table public.driver_username_accounts enable row level security;
drop policy if exists driver_username_admin_select on public.driver_username_accounts;
create policy driver_username_admin_select on public.driver_username_accounts
  for select to authenticated using ((select public.is_admin()));
-- All writes go exclusively through admin-only server code using a server-secret key.
revoke all on public.driver_username_accounts from anon, authenticated;
grant select on public.driver_username_accounts to authenticated;

-- Resolve account by immutable auth user UUID, never by a typed/displayed username or email.
-- This intentionally retires email-OTP driver authorization; admin privileges remain separately guarded by is_admin().
create or replace function public.my_driver_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select a.driver_id from public.driver_username_accounts a
  where a.auth_user_id = (select auth.uid()) limit 1;
$$;
revoke all on function public.my_driver_id() from public, anon, authenticated;
grant execute on function public.my_driver_id() to authenticated;

-- Prevent old OTP authentication from granting driver permission via the legacy email mapping.
revoke all on public.driver_login_emails from anon, authenticated;
