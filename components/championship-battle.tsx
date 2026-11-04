'use client'
import { useState } from 'react'
import type { Driver } from '@/lib/championship'
import type { BattleSeries } from '@/lib/battle'
const COLORS=['#ef4444','#f59e0b','#38bdf8','#a78bfa','#34d399','#f472b6','#a3e635','#facc15','#d1d5db','#fb923c']
export function ChampionshipBattle({drivers,series}:{drivers:Driver[];series:BattleSeries}){
 const [ids,setIds]=useState<string[]>(drivers.slice(0,4).map(d=>d.id))
 const chosen=drivers.filter(d=>ids.includes(d.id))
 const W=760,H=300,L=46,T=20,R=26,B=42
 const max=Math.max(10,...series.points.flatMap(p=>chosen.map(d=>p.totals[d.id]??0)))
 const x=(i:number)=>L+i*(W-L-R)/Math.max(1,series.points.length-1)
 const y=(n:number)=>T+(H-T-B)*(1-n/max)
 return <div className="rounded-sm border border-border bg-card p-5">
  <h3 className="text-2xl font-black uppercase italic">Championship Battle</h3><p className="mb-4 text-sm text-muted-foreground">Cumulative points and official current totals</p>
  <div className="mb-4 flex flex-wrap gap-2">{drivers.map((d,i)=><label key={d.id} className="flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold uppercase"><input type="checkbox" checked={ids.includes(d.id)} onChange={e=>setIds(old=>e.target.checked?[...old,d.id]:old.filter(id=>id!==d.id))}/><span className="size-2 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>{d.name}</label>)}</div>
  {series.points.length<=1?<p className="py-8 text-sm text-muted-foreground">Add race results to see the points progression.</p>:<div className="overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Points progression chart">
   {[0,.25,.5,.75,1].map(p=><g key={p}><line x1={L} y1={y(max*p)} x2={W-R} y2={y(max*p)} stroke="currentColor" strokeOpacity=".18"/><text x={L-8} y={y(max*p)+4} fill="currentColor" fontSize="11" textAnchor="end">{Math.round(max*p)}</text></g>)}
   {series.points.map((p,i)=><text key={`${i}-${p.round}`} x={x(i)} y={H-12} fill="currentColor" fontSize="11" textAnchor="middle">{p.round}</text>)}
   {chosen.map(d=>{const c=COLORS[drivers.findIndex(e=>e.id===d.id)%COLORS.length];return <g key={d.id}><polyline fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" points={series.points.map((p,i)=>`${x(i)},${y(p.totals[d.id]??0)}`).join(' ')}/>{series.points.map((p,i)=><circle key={i} cx={x(i)} cy={y(p.totals[d.id]??0)} r="4" fill={c}><title>{d.name}: {p.round}, {p.totals[d.id]??0} pts</title></circle>)}</g>})}
  </svg></div>}
  {!!series.reconciliations.length&&<p className="my-4 rounded-sm border border-amber-600/40 p-3 text-xs text-muted-foreground">"Current" shows the official manually editable points. Older rounds show the totals from Race Results. Historical manual changes cannot be assigned to past rounds without records; the chart does not invent their dates.</p>}
  {series.points.length>1&&<div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2">Round</th>{chosen.map(d=><th className="px-2 py-2 text-right" key={d.id}>{d.name}</th>)}</tr></thead><tbody>{series.points.map((p,i)=><tr key={i} className="border-b border-border/50"><td className="py-2">{p.round}</td>{chosen.map(d=><td key={d.id} className="px-2 py-2 text-right font-mono">{p.totals[d.id]??0}</td>)}</tr>)}</tbody></table></div>}
 </div>
}
