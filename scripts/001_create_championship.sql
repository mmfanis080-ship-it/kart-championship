-- Kart championship schema. Public can read; only users listed in public.admins can write.

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  number int not null check (number between 0 and 999),
  name text not null check (char_length(name) between 1 and 80),
  team text not null check (char_length(team) between 1 and 80),
  nationality text not null default '' check (char_length(nationality) <= 3),
  points int not null default 0 check (points >= 0),
  wins int not null default 0 check (wins >= 0),
  podiums int not null default 0 check (podiums >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  round int not null unique check (round > 0),
  name text not null,
  track text not null,
  race_date date not null,
  completed boolean not null default false
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

alter table public.drivers enable row level security;
alter table public.races enable row level security;
alter table public.admins enable row level security;

create policy "drivers_public_read" on public.drivers for select using (true);
create policy "drivers_admin_insert" on public.drivers for insert with check (public.is_admin());
create policy "drivers_admin_update" on public.drivers for update using (public.is_admin()) with check (public.is_admin());
create policy "drivers_admin_delete" on public.drivers for delete using (public.is_admin());

create policy "races_public_read" on public.races for select using (true);
create policy "races_admin_insert" on public.races for insert with check (public.is_admin());
create policy "races_admin_update" on public.races for update using (public.is_admin()) with check (public.is_admin());
create policy "races_admin_delete" on public.races for delete using (public.is_admin());

-- Users can only see whether they themselves are an admin. Grant admin with:
--   insert into public.admins (user_id) select id from auth.users where email = '<your email>';
create policy "admins_read_self" on public.admins for select using (auth.uid() = user_id);

insert into public.drivers (number, name, team, nationality, points, wins, podiums) values
  (44, 'Luca Moretti', 'Scuderia Rosso', 'ITA', 186, 5, 8),
  (7, 'Emma Hartley', 'Apex Kart Works', 'GBR', 171, 3, 9),
  (16, 'Mateo Silva', 'Velocità Racing', 'BRA', 154, 2, 7),
  (22, 'Noah Becker', 'Scuderia Rosso', 'GER', 132, 1, 5),
  (3, 'Chloé Laurent', 'Grid Zero', 'FRA', 118, 1, 4),
  (81, 'Kenji Tanaka', 'Apex Kart Works', 'JPN', 97, 0, 3),
  (11, 'Sofia Novak', 'Velocità Racing', 'CZE', 84, 0, 2),
  (5, 'Oliver Grant', 'Grid Zero', 'AUS', 66, 0, 1),
  (27, 'Aarav Mehta', 'Torque Motorsport', 'IND', 43, 0, 0),
  (9, 'Isabel Cruz', 'Torque Motorsport', 'ESP', 29, 0, 0);

insert into public.races (round, name, track, race_date, completed) values
  (1, 'Season Opener', 'Lonato South Garda', '2026-03-14', true),
  (2, 'Spring Sprint', 'PFI Brandon', '2026-04-11', true),
  (3, 'Grand Prix of Genk', 'Karting Genk', '2026-05-16', true),
  (4, 'Summer Classic', 'Circuit Zuera', '2026-06-20', true),
  (5, 'Night Race', 'Kristianstad', '2026-07-25', true),
  (6, 'Autumn Trophy', 'Le Mans Karting', '2026-09-19', true),
  (7, 'Championship Decider', 'Adria Karting Raceway', '2026-10-17', false),
  (8, 'Season Finale', 'Kartódromo Internacional do Algarve', '2026-11-14', false)
on conflict (round) do nothing;
