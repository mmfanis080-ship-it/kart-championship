/** Pure championship ranking helpers, kept independent from Supabase/Next.js. */
export type StandingsResult = {
  driver_id: string
  race_id: string
  position: number
  points: number
}

export type StandingsRace = { id: string; round: number }

export function totalPointsFromResults(results: StandingsResult[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const result of results) {
    totals.set(result.driver_id, (totals.get(result.driver_id) ?? 0) + (result.points ?? 0))
  }
  return totals
}

/**
 * Rank by actual championship points, then countback (most wins, most seconds,
 * most thirds, etc. across ALL classified positions, including non-point finishes).
 * If still level, use the better finish in the earliest round as a deterministic
 * tie-break, followed by name. This matches the existing site's tie rules.
 */
export function sortDriverStandings<T extends { id: string; name: string; points: number }>(
  drivers: T[],
  races: StandingsRace[],
  results: StandingsResult[],
): T[] {
  const countsByDriver = new Map<string, Map<number, number>>()
  const finishesByDriver = new Map<string, Map<string, number>>()
  for (const result of results) {
    if (!Number.isInteger(result.position) || result.position < 1) continue
    const counts = countsByDriver.get(result.driver_id) ?? new Map<number, number>()
    counts.set(result.position, (counts.get(result.position) ?? 0) + 1)
    countsByDriver.set(result.driver_id, counts)

    const finishes = finishesByDriver.get(result.driver_id) ?? new Map<string, number>()
    finishes.set(result.race_id, result.position)
    finishesByDriver.set(result.driver_id, finishes)
  }
  const maxPosition = Math.max(0, ...results.map((result) => result.position).filter((p) => Number.isInteger(p) && p > 0))
  const raceIds = [...races].sort((a, b) => a.round - b.round).map((race) => race.id)

  return [...drivers].sort((a, b) => {
    const pointDiff = b.points - a.points
    if (pointDiff !== 0) return pointDiff
    const aCounts = countsByDriver.get(a.id)
    const bCounts = countsByDriver.get(b.id)
    for (let position = 1; position <= maxPosition; position++) {
      const diff = (bCounts?.get(position) ?? 0) - (aCounts?.get(position) ?? 0)
      if (diff !== 0) return diff
    }
    const aFinishes = finishesByDriver.get(a.id)
    const bFinishes = finishesByDriver.get(b.id)
    for (const raceId of raceIds) {
      const diff = (aFinishes?.get(raceId) ?? Infinity) - (bFinishes?.get(raceId) ?? Infinity)
      // Infinity - Infinity is NaN; both missing is a tie.
      if (Number.isFinite(diff) && diff !== 0) return diff
      if (aFinishes?.has(raceId) && !bFinishes?.has(raceId)) return -1
      if (!aFinishes?.has(raceId) && bFinishes?.has(raceId)) return 1
    }
    return a.name.localeCompare(b.name)
  })
}
