'use client'

import { useMemo, useState } from 'react'
import type { PredictorDriver, PredictorRound } from '@/lib/predictor'
import type { StandingsResult } from '@/lib/standings'

type Props = {drivers: PredictorDriver[]; races: PredictorRound[]; results: StandingsResult[]}
type GridMode = 'random'|'reverse'|'standings'|'lastRace'
function randomGrid(ids:string[]) {
  const shuffled=[...ids]
  for(let i=shuffled.length-1;i>0;i--){
    const bytes = new Uint32Array(1)
    crypto.getRandomValues(bytes)
    const j=bytes[0]%(i+1)
    ;[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]
  }
  return shuffled
}
export function StartingGridGenerator({drivers,races,results}:Props){
  const [mode,setMode]=useState<GridMode>('random')
  const [included,setIncluded]=useState<string[]>(drivers.map(d=>d.id))
  const [generated,setGenerated]=useState<string[]|null>(null)
  const [copied,setCopied]=useState(false)
  const lastRace=[...races].filter(r=>results.some(result=>result.race_id===r.id)).sort((a,b)=>b.round-a.round)[0]
  const byId=useMemo(()=>new Map(drivers.map(d=>[d.id,d])),[drivers])
  function generate(){
    const selected=drivers.filter(d=>included.includes(d.id))
    let order=selected.map(d=>d.id)
    if(mode==='random')order=randomGrid(order)
    if(mode==='reverse')order=order.reverse()
    if(mode==='lastRace' && lastRace){
      const last=new Map(results.filter(r=>r.race_id===lastRace.id).map(r=>[r.driver_id,r.position]))
      order.sort((a,b)=>(last.get(a)??Infinity)-(last.get(b)??Infinity))
    }
    setGenerated(order);setCopied(false)
  }
  const grid=(generated??[]).filter(id=>included.includes(id))
  async function copyGrid(){
    const content=`STARTING GRID\n${grid.map((id,i)=>`P${i+1} — ${byId.get(id)?.name??id}`).join('\n')}`
    try { await navigator.clipboard.writeText(content);setCopied(true) } catch {setCopied(false) }
  }
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <section className="rounded-sm border border-border bg-card p-4 sm:p-6">
      <h2 className="text-xl font-black uppercase italic">Grid setup</h2>
      <p className="mt-2 text-sm text-muted-foreground">Choose participating drivers and a start-order method. This does not change race results or attendance.</p>
      <label htmlFor="grid-method" className="mt-5 block text-xs font-bold uppercase">Grid method</label>
      <select id="grid-method" value={mode} onChange={e=>{setMode(e.target.value as GridMode);setGenerated(null)}} className="mt-2 min-h-12 w-full rounded-sm border border-border bg-background px-3">
        <option value="random">Random draw</option><option value="reverse">Reverse championship order</option><option value="standings">Current championship order</option><option value="lastRace" disabled={!lastRace}>Previous race classification</option>
      </select>
      <div className="mt-4 flex items-center justify-between gap-2"><p className="font-bold uppercase">Drivers ({included.length})</p><div className="flex gap-2"><button type="button" onClick={()=>{setIncluded(drivers.map(d=>d.id));setGenerated(null)}} className="text-xs underline">All</button><button type="button" onClick={()=>{setIncluded([]);setGenerated(null)}} className="text-xs underline">None</button></div></div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">{drivers.map(d=><label key={d.id} className="flex min-h-12 items-center gap-3 rounded-sm border border-border bg-background px-3 text-sm"><input type="checkbox" checked={included.includes(d.id)} onChange={e=>{setIncluded(old=>e.target.checked?[...old,d.id]:old.filter(id=>id!==d.id));setGenerated(null)}}/><span className="min-w-0 break-words">{d.name}</span></label>)}</div>
      <button type="button" disabled={!included.length} onClick={generate} className="mt-5 min-h-12 w-full rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground disabled:opacity-50">Generate starting grid</button>
    </section>
    <section className="rounded-sm border border-border bg-card p-4 sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black uppercase italic">Starting grid</h2><span className="font-mono text-xs text-muted-foreground">{grid.length} karts</span></div>
      {grid.length ? <><ol className="mt-4 grid gap-2">{grid.map((id,index)=><li key={id} className="flex min-w-0 items-center gap-3 rounded-sm border border-border bg-background p-3"><span className={`w-10 shrink-0 font-mono text-2xl font-black ${index===0?'text-primary':''}`}>P{index+1}</span><div className="min-w-0"><p className="break-words font-bold uppercase">{byId.get(id)?.name}</p><p className="text-xs text-muted-foreground">{byId.get(id)?.team}</p></div></li>)}</ol><button type="button" onClick={copyGrid} className="mt-4 min-h-12 w-full rounded-sm border border-primary px-4 font-bold uppercase text-primary">{copied?'Copied!':'Copy grid'}</button></>:<p className="mt-5 text-sm text-muted-foreground">Pick your drivers and press Generate to see the grid.</p>}
      <p className="mt-4 text-xs text-muted-foreground">The generated grid exists only in this browser until you leave or refresh the page. Send the copied grid to the drivers if needed.</p>
    </section>
  </div>
}
