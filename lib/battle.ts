import type { Driver, Race, ResultRow } from './championship'
export type BattlePoint = { round: string; totals: Record<string,number> }
export type BattleSeries = { points: BattlePoint[]; reconciliations: { driverId:string; driverName:string; difference:number }[] }
/** Existing totals are Admin-editable; never silently rewrite history using manual totals. */
export function buildBattleSeries(drivers: Driver[],races: Race[],results:ResultRow[]):BattleSeries {
 const running:Record<string,number>=Object.fromEntries(drivers.map(d=>[d.id,0]))
 const points:BattlePoint[]=[{round:'Start',totals:{...running}}]
 for (const race of races.filter(r=>r.completed).sort((a,b)=>a.round-b.round)) {
  for(const result of results) if(result.race_id===race.id && result.driver_id in running) running[result.driver_id]+=(result.points??0)
  points.push({round:`R${race.round}`,totals:{...running}})
 }
 const reconciliations=drivers.map(d=>({driverId:d.id,driverName:d.name,difference:d.points-(running[d.id]??0)})).filter(d=>d.difference!==0)
 if(reconciliations.length)points.push({round:'Current',totals:Object.fromEntries(drivers.map(d=>[d.id,d.points]))})
 return {points,reconciliations}
}
export function finishForm(driverId:string,races:Race[],results:ResultRow[],limit=5):(number|null)[] {
 const byRace=new Map(results.filter(r=>r.driver_id===driverId).map(r=>[r.race_id,r.position]))
 return races.filter(r=>r.completed).slice(-limit).map(r=>byRace.get(r.id)??null)
}
