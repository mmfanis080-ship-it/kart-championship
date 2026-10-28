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
  results: LapResult[]
}

type JoinedDriver = { photo_url: string | null; team: string | null }

export async function getLapSessions(): Promise<LapSession[]> {
  try {
    const supabase = await createClient()
    const [sessions, results] = await Promise.all([
      supabase.from('lap_sessions').select('id, name, track, session_date').order('session_date', { ascending: false }),
      supabase
        .from('lap_results')
        .select('id, session_id, driver_id, driver_name, kart, best_ms, s1_ms, s2_ms, s3_ms, laps_ms, drivers(photo_url, team)')
        .order('best_ms', { ascending: true }),
    ])
    if (sessions.error || results.error) {
      console.error('Lap times unavailable:', sessions.error?.message ?? results.error?.message)
      return []
    }
    return (sessions.data ?? []).map((session) => ({
      ...session,
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
    }))
  } catch (error) {
    console.error('Lap times failed:', error)
    return []
  }
}
