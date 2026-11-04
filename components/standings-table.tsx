'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Driver,Race,ResultRow } from '@/lib/championship'
import { finishForm } from '@/lib/battle'
export function StandingsTable({drivers,races,results}:{drivers:Driver[];races:Race[];results:ResultRow[]}){
 const [round,setRound]=useState('season')
 const complete=races.filter(r=>r.completed)
 const selected=complete.find(r=>r.id===round)
 const scored=new Map(results.filter(r=>r.race_id===round).map(r=>[r.driver_id,r]))
 const visible=selected?[...drivers].sort((a,b)=>(scored.get(a.id)?.position??Infinity)-(scored.get(b.id)?.position??Infinity)||a.name.localeCompare(b.name)):drivers
 const leader=drivers[0]?.points??0
 if(!drivers.length)return <p className="rounded-sm border border-border p-8">No drivers yet.</p>
 return <div className="flex flex-col gap-3">
  <div className="flex flex-col items-stretch gap-2 rounded-sm border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"><label htmlFor="standings-view" className="font-mono text-xs uppercase text-muted-foreground">Standings view</label><select id="standings-view" className="min-h-11 w-full min-w-0 rounded-sm border border-border bg-background px-3 py-2 text-sm sm:min-h-0 sm:w-auto" value={round} onChange={e=>setRound(e.target.value)}><option value="season">Official championship</option>{complete.map(r=><option key={r.id} value={r.id}>Round {r.round}: {r.name}</option>)}</select><span className="text-xs text-muted-foreground">{selected?'Race classification':'Points from Admin · countback on ties'}</span></div>
  <div className="grid gap-3 sm:hidden" aria-label="Mobile championship standings">
   {visible.map((d,i) => {
    const result=scored.get(d.id)
    const form=finishForm(d.id,complete,results)
    return (
      <article key={d.id} className={`min-w-0 rounded-sm border bg-card p-4 ${i===0?'border-primary/60':'border-border'}`}>
        <div className="flex items-start gap-3">
          <span className={`shrink-0 font-mono text-2xl font-black ${i===0?'text-primary':'text-muted-foreground'}`}>
            {selected&&!result?'–':String(i+1).padStart(2,'0')}
          </span>
          <div className="min-w-0 flex-1">
            <Link href={`/drivers/${d.id}`} className="block break-words text-base font-black uppercase leading-tight hover:text-primary">{d.name}</Link>
            <p className="mt-1 break-words text-xs text-muted-foreground">{d.team}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-2xl font-black tabular-nums">{selected?(result?.points??'–'):d.points}</p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">{selected?'Race pts':'Total pts'}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
          <div className="rounded-sm bg-background/50 p-2">
            <span className="text-muted-foreground">{selected?'Finish':'Wins'}</span>
            <p className="mt-1 font-mono text-base font-bold">{selected?(result?`P${result.position}`:'–'):d.wins}</p>
          </div>
          <div className="rounded-sm bg-background/50 p-2">
            <span className="text-muted-foreground">{selected?'Championship total':'Gap to leader'}</span>
            <p className="mt-1 font-mono text-base font-bold">{selected?d.points:(i===0?'Leader':`−${leader-d.points}`)}</p>
          </div>
        </div>
        {!selected&&<>
          {form.length>0&&<div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Recent finishes</p>
            <div className="flex flex-wrap gap-1">{form.map((position,j)=><span key={j} className={`rounded-sm border px-2 py-1 font-mono text-xs ${position===1?'border-primary text-primary':'border-border text-muted-foreground'}`}>{position?`P${position}`:'–'}</span>)}</div>
          </div>}
          {complete.length>0&&<div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Points per round</p>
            <dl className="grid grid-cols-5 gap-1.5">
              {complete.map(r=><div key={r.id} className="min-w-0 rounded-sm border border-border p-1.5 text-center">
                <dt className="font-mono text-[10px] text-muted-foreground">R{r.round}</dt>
                <dd className="font-mono text-sm font-bold tabular-nums">{d.pointsByRace[r.id]??'–'}</dd>
              </div>)}
            </dl>
          </div>}
        </>}
      </article>
    )
   })}
  </div>
  <div className="hidden overflow-x-auto rounded-sm border border-border bg-card sm:block"><table className="w-full min-w-[750px] text-left"><caption className="sr-only">Official standings and race results</caption><thead><tr className="border-b border-border font-mono text-[11px] uppercase text-muted-foreground"><th className="p-3">Pos</th><th className="p-3">Driver</th><th className="p-3">Team</th>{!selected&&complete.map(r=><th className="p-3 text-right" title={r.name} key={r.id}>R{r.round}</th>)}{!selected&&<th className="p-3">Last 5</th>}<th className="p-3 text-right">{selected?'Finish':'Wins'}</th><th className="p-3 text-right">{selected?'Race points':'Gap'}</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{visible.map((d,i)=>{
   const result=scored.get(d.id);const form=finishForm(d.id,complete,results)
   return <tr key={d.id} className="border-b border-border/50 hover:bg-accent/40"><td className={`p-3 font-mono text-xl font-bold ${i===0?'text-primary':''}`}>{selected&&!result?'–':String(i+1).padStart(2,'0')}</td><td className="p-3 font-bold uppercase"><Link href={`/drivers/${d.id}`} className="hover:text-primary">{d.name}</Link></td><td className="p-3 text-sm text-muted-foreground">{d.team}</td>{!selected&&complete.map(r=><td key={r.id} className="p-3 text-right font-mono text-sm">{d.pointsByRace[r.id]??'–'}</td>)}{!selected&&<td className="p-3"><div className="flex gap-1">{form.length?form.map((p,j)=><span key={j} className={`rounded-sm border px-2 py-1 font-mono text-xs ${p===1?'border-primary text-primary':'border-border text-muted-foreground'}`}>{p??'–'}</span>):'–'}</div></td>}<td className="p-3 text-right font-mono">{selected?(result?`P${result.position}`:'–'):d.wins}</td><td className="p-3 text-right font-mono text-muted-foreground">{selected?(result?.points??'–'):(i===0?'Leader':`−${leader-d.points}`)}</td><td className="p-3 text-right font-mono text-lg font-bold">{d.points}</td></tr>})}</tbody></table></div>
  <p className="text-xs text-muted-foreground">The official ranking uses stored editable totals. Round views only display race results; neither ratings nor manual points are overwritten.</p>
 </div>
}
