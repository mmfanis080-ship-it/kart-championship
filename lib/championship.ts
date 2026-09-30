import { isSupabaseConfigured } from './supabase/config'
import { createClient } from './supabase/server'

export type DriverRow = {
  id: string
  name: string
  team: string
  points: number
  photo_url: string | null
}

export type RaceRow = {
  id: string
  round: number
  name: string
  track: string | null
  race_date: string | null
  race_time: string | null
  details: string | null
  track_image_url: string | null
}

export type ResultRow = {
  id: string
  driver_id: string
  race_id: string
  position: number
  points: number
}

export type Driver = DriverRow & {
  wins: number
  podiums: number
  bestFinish: number | null
  pointsByRace: Record<string, number>
}

export type Race = RaceRow & { completed: boolean }

export type Constructor = {
  team: string
  points: number
  wins: number
  podiums: number
  drivers: string[]
}

export type ClassifiedResult = ResultRow & { driverName: string; team: string }

export type DataSource = 'live' | 'demo' | 'error'

export type Championship = {
  drivers: Driver[]
  constructors: Constructor[]
  races: Race[]
  results: ResultRow[]
  source: DataSource
  errorMessage?: string
}

const demoDriverRows: DriverRow[] = [
  { id: 'd1', name: 'Luca Moretti', team: 'Scuderia Rosso', points: 25, photo_url: null },
  { id: 'd2', name: 'Emma Hartley', team: 'Apex Kart Works', points: 18, photo_url: null },
  { id: 'd3', name: 'Mateo Silva', team: 'Velocità Racing', points: 15, photo_url: null },
  { id: 'd4', name: 'Noah Becker', team: 'Scuderia Rosso', points: 12, photo_url: null },
  { id: 'd5', name: 'Chloé Laurent', team: 'Grid Zero', points: 10, photo_url: null },
  { id: 'd6', name: 'Kenji Tanaka', team: 'Apex Kart Works', points: 8, photo_url: null },
]
const demoRaceRows: RaceRow[] = [{ id: 'r1', round: 1, name: 'Season Opener', track: 'Demo Circuit', race_date: '2026-03-14', race_time: null, details: null, track_image_url: null }]
const demoResults: ResultRow[] = demoDriverRows.map((driver, index) => ({
  id: `res${index}`,
  driver_id: driver.id,
  race_id: 'r1',
  position: index + 1,
  points: driver.points,
}))

function buildChampionship(
  driverRows: DriverRow[],
  raceRows: RaceRow[],
  results: ResultRow[],
  source: DataSource,
): Championship {
  const racesWithResults = new Set(results.map((result) => result.race_id))

  const drivers = driverRows
    .map((row) => {
      const own = results.filter((result) => result.driver_id === row.id)
      const positions = own.map((result) => result.position).filter((p) => p > 0)
      return {
        ...row,
        points: row.points ?? 0,
        wins: positions.filter((p) => p === 1).length,
        podiums: positions.filter((p) => p <= 3).length,
        bestFinish: positions.length > 0 ? Math.min(...positions) : null,
        pointsByRace: Object.fromEntries(own.map((result) => [result.race_id, result.points ?? 0])),
      }
    })
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        b.podiums - a.podiums ||
        (a.bestFinish ?? 999) - (b.bestFinish ?? 999) ||
        a.name.localeCompare(b.name),
    )

  const races = [...raceRows]
    .sort((a, b) => a.round - b.round)
    .map((race) => ({ ...race, completed: racesWithResults.has(race.id) }))

  const byTeam = new Map<string, Constructor>()
  for (const driver of drivers) {
    const entry = byTeam.get(driver.team) ?? { team: driver.team, points: 0, wins: 0, podiums: 0, drivers: [] }
    entry.points += driver.points
    entry.wins += driver.wins
    entry.podiums += driver.podiums
    entry.drivers.push(driver.name)
    byTeam.set(driver.team, entry)
  }
  const constructors = [...byTeam.values()].sort(
    (a, b) => b.points - a.points || b.wins - a.wins || a.team.localeCompare(b.team),
  )

  return { drivers, constructors, races, results, source }
}

export async function getChampionship(): Promise<Championship> {
  if (!isSupabaseConfigured) return buildChampionship(demoDriverRows, demoRaceRows, demoResults, 'demo')

  const supabase = await createClient()
  const [drivers, races, results] = await Promise.all([
    supabase.from('drivers').select('id, name, team, points, photo_url'),
    supabase.from('races').select('id, round, name, track, race_date, race_time, details, track_image_url'),
    supabase.from('results').select('id, driver_id, race_id, position, points'),
  ])

  const failure = drivers.error ?? races.error ?? results.error
  if (failure) {
    console.error('Failed to load championship data:', failure.message)
    return { drivers: [], constructors: [], races: [], results: [], source: 'error', errorMessage: failure.message }
  }

  return buildChampionship(
    (drivers.data ?? []) as DriverRow[],
    (races.data ?? []) as RaceRow[],
    (results.data ?? []) as ResultRow[],
    'live',
  )
}

export function classifyRace(championship: Championship, raceId: string): ClassifiedResult[] {
  const byId = new Map(championship.drivers.map((driver) => [driver.id, driver]))
  return championship.results
    .filter((result) => result.race_id === raceId)
    .map((result) => ({
      ...result,
      driverName: byId.get(result.driver_id)?.name ?? 'Unknown driver',
      team: byId.get(result.driver_id)?.team ?? '',
    }))
    .sort((a, b) => a.position - b.position)
}

export function driverHistory(championship: Championship, driverId: string) {
  const races = new Map(championship.races.map((race) => [race.id, race]))
  return championship.results
    .filter((result) => result.driver_id === driverId)
    .map((result) => ({ ...result, race: races.get(result.race_id) }))
    .filter((entry): entry is typeof entry & { race: Race } => Boolean(entry.race))
    .sort((a, b) => a.race.round - b.race.round)
}
