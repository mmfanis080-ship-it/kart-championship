-- Run this ONCE in the Supabase SQL Editor (before deploying the new code).
-- Adds the Round 3 race lap times. Older sessions are kept. Safe to run if 006 was already run.

alter table public.lap_sessions
  add column if not exists race_id uuid references public.races(id) on delete set null;
-- In a race, lap 1 is a real lap (it counts); in the earlier sessions it is the time since the session started
alter table public.lap_sessions
  add column if not exists first_lap_counts boolean not null default false;

-- Link older sessions to the race with the same date
update public.lap_sessions s
set race_id = r.id
from public.races r
where s.race_id is null and s.session_date = r.race_date;

insert into public.lap_sessions (name, track, session_date, race_id, first_lap_counts)
select 'Race - 390cc', 'Circuit 27 International - Main Track', '2026-11-08',
       (select id from public.races where round = 3 limit 1), true
on conflict (name, session_date) do update
set race_id = excluded.race_id, first_lap_counts = true;

insert into public.lap_results (session_id, driver_id, driver_name, kart, best_ms, s1_ms, s2_ms, s3_ms, laps_ms)
select s.id, d.id, v.driver_name, v.kart, v.best_ms, v.s1, v.s2, v.s3, v.laps
from (values
  ('STEF', 312, 76213, 23451, 24501, 28261, array[77910,77688,78570,76849,76412,76769,76641,76213,77728,78288]::int[]),
  ('FANIS', 314, 76596, 23570, 24498, 28528, array[78228,77793,79270,77491,76596,77010,78585,77404,77390,76709]::int[]),
  ('ALEX', 301, 76978, 23611, 24960, 28407, array[77486,80504,78028,78025,76978,78375,77208,77795,77807,78424]::int[]),
  ('ELIAS', 302, 77412, 23886, 24750, 28776, array[79121,80811,79280,77412,77633,81680,77905,77484,77925,77713]::int[]),
  ('GIORGOS P.', 309, 77448, 24042, 25098, 28308, array[77885,79300,78543,77790,77743,77448,78014,78067,78015,78682]::int[]),
  ('SOTOS', 307, 77770, 23624, 25264, 28882, array[78812,78261,78509,78652,78789,80854,78201,77770,77999,77826]::int[]),
  ('NIKOS L.', 304, 78014, 23766, 25358, 28890, array[80014,79561,78644,78819,79531,78895,78601,79037,78649,78014]::int[]),
  ('GIORGOS K', 313, 78744, 24035, 25802, 28907, array[79932,80255,79521,78950,80196,79166,79018,78855,78744,78757]::int[]),
  ('ZAN', 306, 79357, 24134, 25564, 29659, array[80545,79659,79357,88585,82415,85977,83576,80136,79745,79800]::int[]),
  ('KIMI', 310, 81077, 24879, 26542, 29656, array[83232,81850,82156,82829,81077,82035,81320,81753,82063,82326]::int[]),
  ('MIKELAKOS', 305, 82137, 25812, 26954, 29371, array[90513,82137,84173,87911,85126,87597,90030,82812,84128]::int[]),
  ('BABIS1', 308, 86728, 26244, 27726, 32758, array[86728]::int[])
) as v(driver_name, kart, best_ms, s1, s2, s3, laps)
cross join (
  select id from public.lap_sessions where name = 'Race - 390cc' and session_date = '2026-11-08'
) s
left join public.drivers d on d.name = v.driver_name
on conflict (session_id, driver_name) do update
set driver_id = excluded.driver_id, kart = excluded.kart, best_ms = excluded.best_ms,
    s1_ms = excluded.s1_ms, s2_ms = excluded.s2_ms, s3_ms = excluded.s3_ms, laps_ms = excluded.laps_ms;

-- Check: sessions and their rounds
select s.name, s.session_date, r.round, count(l.id) as drivers
from public.lap_sessions s
left join public.races r on r.id = s.race_id
left join public.lap_results l on l.session_id = s.id
group by s.name, s.session_date, r.round
order by s.session_date;
