-- Run AFTER migration 008 (driver account system). Public roster contains only public driver names, teams and attendance status.
create or replace function public.attendance_public_roster()
returns table(race_id uuid,driver_id uuid,driver_name text,team text,choice text)
language sql stable security definer set search_path = '' as $$
  select e.race_id, d.id, d.name, d.team, e.choice
  from public.attendance_entries e
  join public.drivers d on d.id=e.driver_id
  where not exists(select 1 from public.results rr where rr.race_id=e.race_id)
  order by d.name;
$$;
revoke all on function public.attendance_public_roster() from public,anon,authenticated;
grant execute on function public.attendance_public_roster() to anon,authenticated;

-- An approved driver may clear ONLY their own answer before the race is completed.
drop policy if exists attendance_driver_delete on public.attendance_entries;
create policy attendance_driver_delete on public.attendance_entries for delete to authenticated
using (driver_id=(select public.my_driver_id())
  and not exists(select 1 from public.results r where r.race_id=attendance_entries.race_id));
