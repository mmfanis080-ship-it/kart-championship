-- DRIVER ACCOUNT / AWARDS MIGRATION -- run AFTER migrations 001..007
-- Additive: no stored driver points, race results, ratings or attendance are deleted.
-- Existing `admins` table remains the sole source of administrator privileges.
create table if not exists public.driver_login_emails (
  driver_id uuid primary key references public.drivers(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint email_normalized check (email = lower(btrim(email)) and length(email) between 5 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);
create table if not exists public.award_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('driver_of_the_day','overtake_of_the_month')),
  title text not null check (length(btrim(title)) between 2 and 120),
  race_id uuid references public.races(id) on delete set null,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint valid_window check (closes_at > opens_at),
  constraint one_race_per_dotd unique (kind, race_id)
);
create table if not exists public.award_nominees (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references public.award_events(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  title text not null default '',
  video_path text,
  created_at timestamptz not null default now(),
  constraint unique_nominee_per_award unique (award_id,driver_id),
  constraint storage_path_safe check (video_path is null or (length(video_path) between 3 and 250 and video_path ~ '^overtakes/[a-zA-Z0-9_./-]+\.mp4$' and video_path not like '%..%'))
);
create table if not exists public.award_votes (
  award_id uuid not null references public.award_events(id) on delete cascade,
  voter_id uuid not null references public.drivers(id) on delete cascade,
  nominee_id uuid not null references public.award_nominees(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (award_id,voter_id)
);

alter table public.driver_login_emails enable row level security;
alter table public.award_events enable row level security;
alter table public.award_nominees enable row level security;
alter table public.award_votes enable row level security;

-- Admin assigns a driver's email. Simply logging in with a new email cannot claim someone else's driver profile.
drop policy if exists driver_login_admin_all on public.driver_login_emails;
create policy driver_login_admin_all on public.driver_login_emails for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

create or replace function public.my_driver_id() returns uuid
language sql stable security definer set search_path = '' as $$
 select d.driver_id from public.driver_login_emails d
 join auth.users u on u.id = auth.uid()
 where d.email = lower(u.email) and u.email_confirmed_at is not null limit 1;
$$;
revoke all on function public.my_driver_id() from public,anon,authenticated;
grant execute on function public.my_driver_id() to authenticated;

-- RLS for driver attendance, preserves existing admin policy and personal-link RPC compatibility.
drop policy if exists attendance_driver_read on public.attendance_entries;
create policy attendance_driver_read on public.attendance_entries for select to authenticated
using (driver_id = (select public.my_driver_id()));
drop policy if exists attendance_driver_insert on public.attendance_entries;
create policy attendance_driver_insert on public.attendance_entries for insert to authenticated
with check (driver_id = (select public.my_driver_id()) and
 exists(select 1 from public.races r where r.id=race_id and not exists(select 1 from public.results z where z.race_id=r.id)));
drop policy if exists attendance_driver_update on public.attendance_entries;
create policy attendance_driver_update on public.attendance_entries for update to authenticated
using (driver_id = (select public.my_driver_id()))
with check (driver_id = (select public.my_driver_id()) and
 exists(select 1 from public.races r where r.id=race_id and not exists(select 1 from public.results z where z.race_id=r.id)));

drop policy if exists awards_public_read on public.award_events;
create policy awards_public_read on public.award_events for select to anon,authenticated
using (published or (select public.is_admin()));
drop policy if exists awards_admin_write on public.award_events;
create policy awards_admin_write on public.award_events for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists nominees_public_read on public.award_nominees;
create policy nominees_public_read on public.award_nominees for select to anon,authenticated
using (exists(select 1 from public.award_events a where a.id=award_id and (a.published or (select public.is_admin()))));
drop policy if exists nominees_admin_write on public.award_nominees;
create policy nominees_admin_write on public.award_nominees for all to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists votes_admin_read on public.award_votes;
create policy votes_admin_read on public.award_votes for select to authenticated using ((select public.is_admin()));
drop policy if exists votes_self_read on public.award_votes;
create policy votes_self_read on public.award_votes for select to authenticated using (voter_id=(select public.my_driver_id()));

-- Single transaction upsert, cannot spoof voter or change vote after closure.
create or replace function public.cast_award_vote(p_award_id uuid,p_nominee_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_driver uuid;
begin
 v_driver := public.my_driver_id();
 if v_driver is null then return false; end if;
 if not exists (
  select 1 from public.award_events a join public.award_nominees n on n.award_id=a.id
  where a.id=p_award_id and n.id=p_nominee_id and a.published
    and statement_timestamp() >= a.opens_at and statement_timestamp() < a.closes_at
 ) then return false; end if;
 insert into public.award_votes(award_id,voter_id,nominee_id)
 values (p_award_id,v_driver,p_nominee_id)
 on conflict(award_id,voter_id) do update set nominee_id=excluded.nominee_id,created_at=now();
 return true;
end; $$;
revoke all on function public.cast_award_vote(uuid,uuid) from public,anon,authenticated;
grant execute on function public.cast_award_vote(uuid,uuid) to authenticated;

-- Vote counts revealed only after voting is closed (admin may preview).
create or replace function public.award_vote_counts(p_award_id uuid)
returns table(nominee_id uuid,votes bigint) language sql stable security definer set search_path = '' as $$
 select n.id,count(v.nominee_id)
 from public.award_nominees n join public.award_events a on a.id=n.award_id
 left join public.award_votes v on v.nominee_id=n.id and v.award_id=n.award_id
 where n.award_id=p_award_id and (a.published and a.closes_at<=now() or public.is_admin())
 group by n.id;
$$;
revoke all on function public.award_vote_counts(uuid) from public,anon,authenticated;
grant execute on function public.award_vote_counts(uuid) to anon,authenticated;

-- Admin-only video upload; public view for published candidates. We keep video storage separate from Vercel functions.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('kart-overtakes','kart-overtakes',true,52428800,array['video/mp4'])
on conflict(id) do update set public=true,file_size_limit=52428800,allowed_mime_types=array['video/mp4'];
drop policy if exists kart_overtakes_admin_select on storage.objects;
create policy kart_overtakes_admin_select on storage.objects for select to authenticated
using (bucket_id='kart-overtakes' and (select public.is_admin()));
drop policy if exists kart_overtakes_admin_upload on storage.objects;
create policy kart_overtakes_admin_upload on storage.objects for insert to authenticated
with check (bucket_id='kart-overtakes' and (select public.is_admin()));
drop policy if exists kart_overtakes_admin_update on storage.objects;
create policy kart_overtakes_admin_update on storage.objects for update to authenticated
using (bucket_id='kart-overtakes' and (select public.is_admin()))
with check (bucket_id='kart-overtakes' and (select public.is_admin()));
drop policy if exists kart_overtakes_admin_delete on storage.objects;
create policy kart_overtakes_admin_delete on storage.objects for delete to authenticated
using (bucket_id='kart-overtakes' and (select public.is_admin()));

-- Grants for RLS-controlled reads/admin writes, with all non-admin writes blocked.
grant select,insert,update,delete on public.driver_login_emails to authenticated;
grant select,insert,update,delete on public.award_events,public.award_nominees to authenticated;
grant select on public.award_events,public.award_nominees to anon;
grant select on public.award_votes to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Switching to account-only attendance: revoke legacy token RPCs and invalidate previously issued links.
-- Existing attendance_entries remain untouched.
update public.attendance_links set revoked_at=now() where revoked_at is null;
revoke execute on function public.attendance_for_token(text) from anon,authenticated;
revoke execute on function public.attendance_submit(text,uuid,text) from anon,authenticated;
