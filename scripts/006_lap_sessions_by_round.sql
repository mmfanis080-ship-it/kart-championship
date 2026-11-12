-- Run this ONCE in the Supabase SQL Editor.
-- Links every lap-time session to a round, so the Laps page can show one tab per round.
-- Old sessions are kept; nothing is deleted.

alter table public.lap_sessions
  add column if not exists race_id uuid references public.races(id) on delete set null;

-- Link existing sessions to the race that has the same date
update public.lap_sessions s
set race_id = r.id
from public.races r
where s.race_id is null
  and s.session_date = r.race_date;

-- Check: which session belongs to which round
select s.name, s.session_date, r.round
from public.lap_sessions s
left join public.races r on r.id = s.race_id
order by s.session_date;
