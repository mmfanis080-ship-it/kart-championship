'use client'

import { useMemo, useState } from 'react'
import { DEFAULT_POINTS, predictStandings, type PredictorDriver, type PredictorRound, type Prediction } from '@/lib/predictor'
import type { StandingsResult, StandingsRace } from '@/lib/standings'

type Props = { drivers: PredictorDriver[]; races: PredictorRound[]; results: StandingsResult[] }
export function ChampionshipPredictor({ drivers, races, results }: Props) {
  const upcoming = races.filter(r => !results.some(result => result.race_id === r.id)).sort((a,b)=>a.round-b.round)
  const [scenario, setScenario] = useState<Record<string, string[]>>({})
  const [selectedRound, setSelectedRound] = useState(upcoming[0]?.id ?? '')
  const active = upcoming.find(r=>r.id===selectedRound) ?? upcoming[0]
  const projected = useMemo(()=>{
    const predictions: Prediction[] = Object.entries(scenario).flatMap(([roundId, ids])=>ids.map((driverId,index)=>({ roundId, driverId, position:index+1 })))
    return predictStandings(drivers, races, results, predictions, DEFAULT_POINTS)
  },[drivers,races,results,scenario])
  const assignments = active ? scenario[active.id] ?? [] : []
  function changeSlot(position: number, driverId: string) {
    if (!active) return
    setScenario(previous=>{
      const old = [...(previous[active.id] ?? [])]
      const oldIndex = old.indexOf(driverId)
      if (oldIndex !== -1 && oldIndex !== position) {
        ;[old[oldIndex],old[position]] = [old[position],old[oldIndex]]
      } else {
        old[position] = driverId
      }
      return {...previous,[active.id]:old.filter(Boolean)}
    })
  }
  function setOrder(order: string[]) { if (active) setScenario(old=>({...old,[active.id]:order})) }
  function removeDriver(driverId:string){ if(active) setScenario(old=>({...old,[active.id]:(old[active.id]??[]).filter(id=>id!==driverId)})) }
  const simulatedRounds=Object.keys(scenario).filter(id=>(scenario[id]?.length??0)>0).length
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="min-w-0 rounded-sm border border-border bg-card p-4 sm:p-6" aria-label="Scenario editor">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black uppercase italic">Future results</h2><span className="font-mono text-xs text-muted-foreground">{simulatedRounds} round(s) simulated</span></div>
      <p className="mt-2 text-sm text-muted-foreground">Select the predicted finish order for each future round. You can leave drivers out (DNS). This is a private preview and does not change the championship.</p>
      {upcoming.length ? <>
        <label htmlFor="predict-round" className="mt-5 block text-xs font-bold uppercase">Race to predict</label>
        <select id="predict-round" className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3" value={active?.id} onChange={e=>setSelectedRound(e.target.value)}>{upcoming.map(r=><option value={r.id} key={r.id}>Round {r.round} — {r.name}</option>)}</select>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={()=>setOrder(drivers.map(d=>d.id))} className="min-h-11 rounded-sm border border-border px-3 text-xs font-bold uppercase hover:border-primary">Use current standings</button>
          <button type="button" onClick={()=>setOrder([])} className="min-h-11 rounded-sm border border-border px-3 text-xs font-bold uppercase hover:border-primary">Clear this round</button>
          <button type="button" onClick={()=>setScenario({})} className="min-h-11 rounded-sm border border-border px-3 text-xs font-bold uppercase hover:border-primary">Reset all</button>
        </div>
        <div className="mt-4 space-y-2">
          {assignments.map((id,index)=><div key={id} className="flex min-w-0 items-center gap-2 rounded-sm border border-border bg-background p-2">
            <span className="w-8 shrink-0 font-mono text-lg font-black text-primary">{index+1}</span>
            <select aria-label={`Position ${index+1}`} className="min-h-11 min-w-0 flex-1 rounded-sm border border-border bg-card px-2" value={id} onChange={e=>changeSlot(index,e.target.value)}>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
            <span className="w-9 text-right font-mono text-xs">+{DEFAULT_POINTS[index]??0}</span>
            <button type="button" onClick={()=>removeDriver(id)} aria-label="Remove driver" className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-border">×</button>
          </div>)}
        </div>
        {assignments.length < drivers.length && <label className="mt-3 block text-sm">Add driver to next position<select aria-label="Add driver" value="" onChange={e=>{if(e.target.value)setOrder([...assignments,e.target.value])}} className="mt-1 min-h-12 w-full rounded-sm border border-border bg-background px-3"><option value="">Choose driver…</option>{drivers.filter(d=>!assignments.includes(d.id)).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>}
        <p className="mt-4 text-xs text-muted-foreground">Scoring: 20–15–12–10–8–6–4–2–1, then zero. You can simulate several remaining races by switching rounds.</p>
      </>:<p className="mt-5 text-sm text-muted-foreground">No future races available. Add a new round in Admin to run predictions.</p>}
    </section>
    <section className="min-w-0 rounded-sm border border-border bg-card p-4 sm:p-6" aria-label="Projected standings">
      <h2 className="text-xl font-black uppercase italic">Projected standings</h2>
      <div className="mt-3 space-y-2">{projected.map((d,index)=><div key={d.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 rounded-sm border border-border bg-background p-3">
        <span className={`font-mono text-lg font-bold ${index===0?'text-primary':''}`}>{index+1}</span>
        <div className="min-w-0"><p className="break-words font-bold uppercase">{d.name}</p><p className="text-xs text-muted-foreground">{d.team}</p></div>
        <div className="text-right"><p className="font-mono text-xl font-bold">{d.points}</p><p className="font-mono text-[11px] text-muted-foreground">{d.added>0?`+${d.added} predicted`:`Current: ${d.points}`}</p></div>
      </div>)}</div>
      <p className="mt-4 text-xs text-muted-foreground">Starting points are the editable Admin totals; ties follow the existing countback (wins, P2, P3…). Previous manual deductions/bonuses remain included. Nothing is written to Supabase.</p>
    </section>
  </div>
}
