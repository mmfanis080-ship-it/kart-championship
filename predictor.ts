import { sortDriverStandings, type StandingsResult, type StandingsRace } from './standings'

// Existing league scoring: first to ninth. Other classified places receive zero.
export const DEFAULT_POINTS = [20, 15, 12, 10, 8, 6, 4, 2, 1] as const
export type PredictorDriver = { id: string; name: string; team: string; points: number }
export type PredictorRound = { id: string; round: number; name: string }
export type Prediction = { driverId: string; position: number; roundId: string }

/** Pure preview: start with stored Admin totals, add only simulated future race points. */
export function predictStandings(
  drivers: PredictorDriver[],
  existingRaces: StandingsRace[],
  existingResults: StandingsResult[],
  predictions: Prediction[],
  scoring: readonly number[] = DEFAULT_POINTS,
) {
  const byId = new Map(drivers.map(d => [d.id, d]))
  const valid = predictions.filter(p => byId.has(p.driverId) && Number.isInteger(p.position) && p.position >= 1)
  const extra = new Map<string, number>()
  const seen = new Set<string>()
  const syntheticResults: StandingsResult[] = []
  for (const p of valid) {
    const key = `${p.roundId}:${p.driverId}`
    const slot = `${p.roundId}:P${p.position}`
    if (seen.has(key) || seen.has(slot)) continue
    seen.add(key); seen.add(slot)
    const points = scoring[p.position - 1] ?? 0
    extra.set(p.driverId, (extra.get(p.driverId) ?? 0) + points)
    syntheticResults.push({ race_id:p.roundId, driver_id:p.driverId, position:p.position, points })
  }
  const projected = drivers.map(d => ({ ...d, added: extra.get(d.id) ?? 0, points: d.points + (extra.get(d.id) ?? 0) }))
  return sortDriverStandings(projected, existingRaces, [...existingResults, ...syntheticResults])
}
