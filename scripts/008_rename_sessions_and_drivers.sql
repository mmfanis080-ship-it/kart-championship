-- Run this ONCE in the Supabase SQL Editor (after 005 and 007).

-- 1) Session names
update public.lap_sessions set name = 'Round 2' where name = 'Session 3 - 390cc' and session_date = '2026-10-11';
update public.lap_sessions set name = 'Round 3' where name = 'Race - 390cc' and session_date = '2026-11-08';

-- 2) Timing-sheet names -> site drivers
--    GIORGOS K (George Russell on the sheet) = GIORGOS
--    GIORGOS P. (GI0RGHS on the sheet)       = PARTOULAS
update public.lap_results
set driver_name = 'GIORGOS',
    driver_id = (select id from public.drivers where name = 'GIORGOS' limit 1)
where driver_name = 'GIORGOS K';

update public.lap_results
set driver_name = 'PARTOULAS',
    driver_id = (select id from public.drivers where name = 'PARTOULAS' limit 1)
where driver_name = 'GIORGOS P.';

-- Check: every session with its round, and which drivers are linked to a site driver
select s.name, s.session_date, r.round,
       count(l.id) as drivers,
       count(l.driver_id) as linked_to_site_drivers
from public.lap_sessions s
left join public.races r on r.id = s.race_id
left join public.lap_results l on l.session_id = s.id
group by s.name, s.session_date, r.round
order by s.session_date;
