-- Run this ONCE in the Supabase SQL Editor (before deploying the new code).
-- Lap-time sessions and results (source: Apex Timing sheet, Circuit 27 International).

create table if not exists public.lap_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  track text not null,
  session_date date,
  unique (name, session_date)
);

create table if not exists public.lap_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lap_sessions(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  driver_name text not null,
  kart int,
  best_ms int not null,
  s1_ms int,
  s2_ms int,
  s3_ms int,
  laps_ms int[],
  unique (session_id, driver_name)
);

alter table public.lap_sessions enable row level security;
alter table public.lap_results enable row level security;

drop policy if exists "lap_sessions_public_read" on public.lap_sessions;
drop policy if exists "lap_sessions_admin_write" on public.lap_sessions;
drop policy if exists "lap_results_public_read" on public.lap_results;
drop policy if exists "lap_results_admin_write" on public.lap_results;
create policy "lap_sessions_public_read" on public.lap_sessions for select using (true);
create policy "lap_sessions_admin_write" on public.lap_sessions for all using (public.is_admin()) with check (public.is_admin());
create policy "lap_results_public_read" on public.lap_results for select using (true);
create policy "lap_results_admin_write" on public.lap_results for all using (public.is_admin()) with check (public.is_admin());

insert into public.lap_sessions (name, track, session_date)
values ('Session 3 - 390cc', 'Circuit 27 International - Main Track', '2026-10-11')
on conflict (name, session_date) do nothing;

insert into public.lap_results (session_id, driver_id, driver_name, kart, best_ms, s1_ms, s2_ms, s3_ms, laps_ms)
select s.id, d.id, v.driver_name, v.kart, v.best_ms, v.s1, v.s2, v.s3, v.laps
from (values
  ('FANIS', 315, 77129, 23795, 24713, 28621, array[540631,82925,78819,78366,77768,77227,77129,77289,78144,77937,78079,78405]::int[]),
  ('ALEX', 305, 77478, 23869, 25126, 28483, array[530745,81533,79391,78720,79547,78174,77944,77478,79240,78466,78317,81465]::int[]),
  ('STEF', 302, 77880, 23984, 25015, 28881, array[544209,83124,78608,79171,79146,77880,78216,77913,79911,78262,78449,78805]::int[]),
  ('GONOS', 309, 77972, 23620, 25362, 28990, array[481107,85238,80008,80192,78732,77972,78876,78482,78035,78194,78264,78237]::int[]),
  ('NIKOS L.', 304, 79229, 24248, 25585, 29396, array[516625,84365,81191,79964,79229,79529,79313,80219,80454,80403,81503,79716]::int[]),
  ('ELIAS', 314, 79500, 24121, 26045, 29334, array[538208,86902,80614,79500,79963,80548,80726,80848,80193,84454,82707,79528]::int[]),
  ('GIORGOS K', 303, 79508, 24826, 25951, 28731, array[494163,85221,80630,80662,79508,82077,80431,80587,80550,83394,80822,80036]::int[]),
  ('SOTOS', 307, 79636, 23920, 26716, 29000, array[521759,83187,83758,81932,79636,80367,79721,81637,81281,84774,80107,80114]::int[]),
  ('ZAN', 306, 79823, 24490, 25872, 29461, array[503644,81764,79823,80799,79989,80305,79953,80929,80536,80437,80482,80536]::int[]),
  ('NIKOS K.', 308, 79854, 24949, 25589, 29316, array[510368,83147,83666,80503,79854,80976,79985,81384,80644,80661,81384,81116]::int[]),
  ('GIORGOS P.', 311, 79888, 23999, 26786, 29103, array[473324,84361,81419,80193,79888,80274,80211,80877,81224,83724,80421,80537]::int[]),
  ('KIMI', 301, 81245, 25025, 26538, 29682, null::int[]),
  ('MIKELAKOS', 312, 81432, 24437, 26639, 30356, null::int[]),
  ('BABIS1', 313, 82287, 25158, 26851, 30278, null::int[])
) as v(driver_name, kart, best_ms, s1, s2, s3, laps)
cross join (
  select id from public.lap_sessions where name = 'Session 3 - 390cc' and session_date = '2026-10-11'
) s
left join public.drivers d on d.name = v.driver_name
on conflict (session_id, driver_name) do update
set driver_id = excluded.driver_id, kart = excluded.kart, best_ms = excluded.best_ms,
    s1_ms = excluded.s1_ms, s2_ms = excluded.s2_ms, s3_ms = excluded.s3_ms, laps_ms = excluded.laps_ms;
