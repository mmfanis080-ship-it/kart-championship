import { createClient } from './supabase/server'

export type LapResult = {
  id: string
  driver_id: string | null
  driver_name: string
  kart: number | null
  best_ms: number
  s1_ms: number | null
  s2_ms: number | null
  s3_ms: number | null
  laps_ms: number[] | null
  photo_url: string | null
  team: string | null
}

export type LapSession = {
  id: string
  name: string
  track: string
  session_date: string | null
  round: number | null
  race_name: string | null
  first_lap_counts: boolean
  results: LapResult[]
}

type JoinedDriver = { photo_url: string | null; team: string | null }
type JoinedRace = { round: number; name: string }

export async function getLapSessions(): Promise<LapSession[]> {
  try {
    const supabase = await createClient()
    const [sessions, results] = await Promise.all([
      supabase.from('lap_sessions').select('id, name, track, session_date, first_lap_counts, races(round, name)').order('session_date', { ascending: false }),
      supabase
        .from('lap_results')
        .select('id, session_id, driver_id, driver_name, kart, best_ms, s1_ms, s2_ms, s3_ms, laps_ms, drivers(photo_url, team)')
        .order('best_ms', { ascending: true }),
    ])
    if (sessions.error || results.error) {
      console.error('Lap times unavailable:', sessions.error?.message ?? results.error?.message)
      return []
    }
    const mapped: LapSession[] = (sessions.data ?? []).map((session) => {
      const race = (Array.isArray(session.races) ? session.races[0] : session.races) as JoinedRace | null | undefined
      return {
      id: session.id,
      name: session.name,
      track: session.track,
      session_date: session.session_date,
      round: race?.round ?? null,
      race_name: race?.name ?? null,
      first_lap_counts: Boolean(session.first_lap_counts),
      results: (results.data ?? [])
        .filter((row) => row.session_id === session.id)
        .map((row) => {
          const joined = (Array.isArray(row.drivers) ? row.drivers[0] : row.drivers) as JoinedDriver | null | undefined
          return {
            id: row.id,
            driver_id: row.driver_id,
            driver_name: row.driver_name,
            kart: row.kart,
            best_ms: row.best_ms,
            s1_ms: row.s1_ms,
            s2_ms: row.s2_ms,
            s3_ms: row.s3_ms,
            laps_ms: row.laps_ms,
            photo_url: joined?.photo_url ?? null,
            team: joined?.team ?? null,
          }
        }),
      }
    })
    // Newest round first; sessions without a round go last
    return mapped.sort(
      (a, b) =>
        (b.round ?? -1) - (a.round ?? -1) || (b.session_date ?? '').localeCompare(a.session_date ?? ''),
    )
  } catch (error) {
    console.error('Lap times failed:', error)
    return []
  }
}
