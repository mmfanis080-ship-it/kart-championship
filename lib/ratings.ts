import type { ResultRow } from '@/lib/championship'
import type { LapSession } from '@/lib/laps'

export type Ratings = {
  rtg: number
  exp: number
  rac: number | null
  pac: number | null
  con: number | null
}

const clamp = (value: number) => Math.max(40, Math.min(99, Math.round(value)))
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * EXP  experience   45 + 6 per race entered
 * RAC  racecraft    average finish vs the field (win = 1, last = 0) -> 40..99
 * PAC  pace         best lap gap to the session's fastest lap, 5 points per 1 %
 * CON  consistency  how little the flying laps scatter around the median lap
 * RTG  overall      RAC 40 %, PAC 30 %, CON 15 %, EXP 15 % (missing parts are left out)
 */
export function computeRatings(driverId: string, results: ResultRow[], sessions: LapSession[]): Ratings {
  const own = results.filter((result) => result.driver_id === driverId && result.position > 0)
  const exp = clamp(45 + 6 * own.length)

  let rac: number | null = null
  if (own.length > 0) {
    const scores = own.map((result) => {
      const field = results.filter((other) => other.race_id === result.race_id && other.position > 0).length
      return field > 1 ? (field - result.position) / (field - 1) : 1
    })
    rac = clamp(40 + 59 * mean(scores))
  }

  const gaps: number[] = []
  const scatter: number[] = []
  for (const session of sessions) {
    const mine = session.results.find((result) => result.driver_id === driverId)
    if (!mine) continue
    const fastest = Math.min(...session.results.map((result) => result.best_ms))
    gaps.push(((mine.best_ms - fastest) / fastest) * 100)
    const flying = (mine.laps_ms ?? []).slice(1)
    if (flying.length >= 3) {
      const mid = median(flying)
      scatter.push((median(flying.map((lap) => Math.abs(lap - mid))) / mid) * 100)
    }
  }
  const pac = gaps.length > 0 ? clamp(99 - 5 * mean(gaps)) : null
  const con = scatter.length > 0 ? clamp(99 - 35 * mean(scatter)) : null

  const parts = [
    { weight: 0.4, value: rac },
    { weight: 0.3, value: pac },
    { weight: 0.15, value: con },
    { weight: 0.15, value: exp },
  ].filter((part): part is { weight: number; value: number } => part.value !== null)
  const rtg = Math.round(parts.reduce((sum, part) => sum + part.weight * part.value, 0) / parts.reduce((sum, part) => sum + part.weight, 0))

  return { rtg, exp, rac, pac, con }
}
