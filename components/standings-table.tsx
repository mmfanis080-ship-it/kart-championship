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
  <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-3"><label htmlFor="standings-view" className="font-mono text-xs uppercase text-muted-foreground">Standings view</label><select id="standings-view" className="rounded-sm border border-border bg-background px-3 py-2 text-sm" value={round} onChange={e=>setRound(e.target.value)}><option value="season">Official championship</option>{complete.map(r=><option key={r.id} value={r.id}>Round {r.round}: {r.name}</option>)}</select><span className="text-xs text-muted-foreground">{selected?'Race classification':'Points from Admin · countback on ties'}</span></div>
  <div className="overflow-x-auto rounded-sm border border-border bg-card"><table className="w-full min-w-[750px] text-left"><caption className="sr-only">Official standings and race results</caption><thead><tr className="border-b border-border font-mono text-[11px] uppercase text-muted-foreground"><th className="p-3">Pos</th><th className="p-3">Driver</th><th className="p-3">Team</th>{!selected&&complete.map(r=><th className="p-3 text-right" title={r.name} key={r.id}>R{r.round}</th>)}{!selected&&<th className="p-3">Last 5</th>}<th className="p-3 text-right">{selected?'Finish':'Wins'}</th><th className="p-3 text-right">{selected?'Race points':'Gap'}</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{visible.map((d,i)=>{
   const result=scored.get(d.id);const form=finishForm(d.id,complete,results)
   return <tr key={d.id} className="border-b border-border/50 hover:bg-accent/40"><td className={`p-3 font-mono text-xl font-bold ${i===0?'text-primary':''}`}>{selected&&!result?'–':String(i+1).padStart(2,'0')}</td><td className="p-3 font-bold uppercase"><Link href={`/drivers/${d.id}`} className="hover:text-primary">{d.name}</Link></td><td className="p-3 text-sm text-muted-foreground">{d.team}</td>{!selected&&complete.map(r=><td key={r.id} className="p-3 text-right font-mono text-sm">{d.pointsByRace[r.id]??'–'}</td>)}{!selected&&<td className="p-3"><div className="flex gap-1">{form.length?form.map((p,j)=><span key={j} className={`rounded-sm border px-2 py-1 font-mono text-xs ${p===1?'border-primary text-primary':'border-border text-muted-foreground'}`}>{p??'–'}</span>):'–'}</div></td>}<td className="p-3 text-right font-mono">{selected?(result?`P${result.position}`:'–'):d.wins}</td><td className="p-3 text-right font-mono text-muted-foreground">{selected?(result?.points??'–'):(i===0?'Leader':`−${leader-d.points}`)}</td><td className="p-3 text-right font-mono text-lg font-bold">{d.points}</td></tr>})}</tbody></table></div>
  <p className="text-xs text-muted-foreground">The official ranking uses stored editable totals. Round views only display race results; neither ratings nor manual points are overwritten.</p>
 </div>
}
