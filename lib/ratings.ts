import type { ResultRow } from '@/lib/championship'
import type { LapSession } from '@/lib/laps'

export type Ratings = {
  rtg: number | null
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
const sameName = (a: string, b: string) =>
  a.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase() ===
  b.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase()

/**
 * EXP experience: 45 + 6 per classified race, max 99.
 * RAC racecraft: average finish relative to classified field, 40..99.
 * PAC pace: average best-lap % gap to the fastest session lap, 5 pts per 1%.
 * CON consistency: robust median absolute deviation of flying laps.
 * RTG overall: RAC 40%, PAC 30%, CON 15%, EXP 15%; reweight known metrics.
 * No performance data => unrated (null RTG), rather than pretending that EXP
 * alone is a measured driver performance rating.
 */
export function computeRatings(driverId: string, results: ResultRow[], sessions: LapSession[], driverName?: string): Ratings {
  const own = results.filter((result) => result.driver_id === driverId && result.position > 0)
  const exp = clamp(45 + 6 * new Set(own.map((result) => result.race_id)).size)

  const raceScores: number[] = []
  for (const result of own) {
    const field = results.filter((other) => other.race_id === result.race_id && other.position > 0)
    // A one-driver/incomplete classification does not establish racecraft.
    const fieldSize = Math.max(0, ...field.map((other) => other.position))
    if (field.length >= 2 && fieldSize > 1 && result.position <= fieldSize) {
      raceScores.push((fieldSize - result.position) / (fieldSize - 1))
    }
  }
  const rac = raceScores.length > 0 ? clamp(40 + 59 * mean(raceScores)) : null

  const gaps: number[] = []
  const scatter: number[] = []
  for (const session of sessions) {
    // The reliable link is driver_id. Only fall back to the name if the
    // lap record has no link at all, never override a different driver's ID.
    const mine = session.results.find((result) =>
      result.driver_id === driverId ||
      (result.driver_id === null && Boolean(driverName) && sameName(result.driver_name, driverName!)),
    )
    if (!mine || !Number.isFinite(mine.best_ms) || mine.best_ms <= 0) continue
    const validBests = session.results.map((entry) => entry.best_ms).filter((lap) => Number.isFinite(lap) && lap > 0)
    if (validBests.length === 0) continue
    const fastest = Math.min(...validBests)
    gaps.push(Math.max(0, ((mine.best_ms - fastest) / fastest) * 100))

    // Filter out pit / out-laps (the provided source has 8-minute first laps).
    // Keep normal laps within 20% of the driver's best for consistency.
    const flying = (mine.laps_ms ?? []).filter((lap) =>
      Number.isFinite(lap) && lap >= mine.best_ms * 0.9 && lap <= mine.best_ms * 1.2,
    )
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
  const rtg = rac === null && pac === null && con === null
    ? null
    : Math.round(parts.reduce((sum, part) => sum + part.weight * part.value, 0) / parts.reduce((sum, part) => sum + part.weight, 0))

  return { rtg, exp, rac, pac, con }
}
