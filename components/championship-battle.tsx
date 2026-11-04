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
 return <div className="min-w-0 rounded-sm border border-border bg-card p-3 sm:p-5">
  <h3 className="text-xl font-black uppercase italic sm:text-2xl">Championship Battle</h3><p className="mb-4 text-sm text-muted-foreground">Cumulative points and official current totals</p>
  <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{drivers.map((d,i)=><label key={d.id} className="flex min-h-11 min-w-0 cursor-pointer items-center gap-2 rounded-sm border border-border px-2 py-2 text-xs font-bold uppercase sm:min-h-0 sm:px-3"><input type="checkbox" className="size-4 shrink-0" checked={ids.includes(d.id)} onChange={e=>setIds(old=>e.target.checked?[...old,d.id]:old.filter(id=>id!==d.id))}/><span className="size-2 rounded-full" style={{background:COLORS[i%COLORS.length]}}/><span className="min-w-0 break-words">{d.name}</span></label>)}</div>
  {series.points.length<=1?<p className="py-8 text-sm text-muted-foreground">Add race results to see the points progression.</p>:<>
   <div className="sm:hidden">
     <svg viewBox="0 0 340 235" className="block h-auto w-full" role="img" aria-label="Championship points progression for selected drivers">
       {[0,.25,.5,.75,1].map(t=><g key={t}>
         <line x1="37" x2="328" y1={12+(205-12)*(1-t)} y2={12+(205-12)*(1-t)} stroke="currentColor" strokeOpacity=".18"/>
         <text x="30" y={16+(205-12)*(1-t)} textAnchor="end" fontSize="11" fill="currentColor">{Math.round(t*max)}</text>
       </g>)}
       {Array.from(new Set([0,Math.floor((series.points.length-1)/2),series.points.length-1])).map(i=><text key={i} x={37+i*(328-37)/Math.max(1,series.points.length-1)} y="229" textAnchor={i===series.points.length-1?'end':i===0?'start':'middle'} fontSize="10" fill="currentColor">{series.points[i].round}</text>)}
       {chosen.map(d=>{
         const c=COLORS[drivers.findIndex(e=>e.id===d.id)%COLORS.length]
         return <g key={d.id}>
           <polyline fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={series.points.map((p,i)=>`${37+i*(328-37)/Math.max(1,series.points.length-1)},${12+(205-12)*(1-(p.totals[d.id]??0)/max)}`).join(' ')}/>
           {series.points.map((p,i)=><circle key={i} cx={37+i*(328-37)/Math.max(1,series.points.length-1)} cy={12+(205-12)*(1-(p.totals[d.id]??0)/max)} r="3" fill={c}><title>{d.name}: {p.round}, {p.totals[d.id]??0} pts</title></circle>)}
         </g>
       })}
     </svg>
     <p className="mt-1 text-xs text-muted-foreground">Tap drivers above to show/hide their line.</p>
   </div>
   <div className="hidden overflow-x-auto sm:block"><svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Points progression chart">
   {[0,.25,.5,.75,1].map(p=><g key={p}><line x1={L} y1={y(max*p)} x2={W-R} y2={y(max*p)} stroke="currentColor" strokeOpacity=".18"/><text x={L-8} y={y(max*p)+4} fill="currentColor" fontSize="11" textAnchor="end">{Math.round(max*p)}</text></g>)}
   {series.points.map((p,i)=><text key={`${i}-${p.round}`} x={x(i)} y={H-12} fill="currentColor" fontSize="11" textAnchor="middle">{p.round}</text>)}
   {chosen.map(d=>{const c=COLORS[drivers.findIndex(e=>e.id===d.id)%COLORS.length];return <g key={d.id}><polyline fill="none" stroke={c} strokeWidth="3" strokeLinejoin="round" points={series.points.map((p,i)=>`${x(i)},${y(p.totals[d.id]??0)}`).join(' ')}/>{series.points.map((p,i)=><circle key={i} cx={x(i)} cy={y(p.totals[d.id]??0)} r="4" fill={c}><title>{d.name}: {p.round}, {p.totals[d.id]??0} pts</title></circle>)}</g>})}
  </svg></div></>}
  {!!series.reconciliations.length&&<p className="my-4 rounded-sm border border-amber-600/40 p-3 text-xs text-muted-foreground">"Current" shows the official manually editable points. Older rounds show the totals from Race Results. Historical manual changes cannot be assigned to past rounds without records; the chart does not invent their dates.</p>}
  {series.points.length>1&&<>
   <div className="mt-4 grid gap-2 sm:hidden" aria-label="Points by round on mobile">
     {series.points.map((p,i)=><div key={i} className="rounded-sm border border-border p-2.5">
       <p className="mb-2 font-mono text-xs font-bold text-primary">{p.round}</p>
       <dl className="grid grid-cols-2 gap-2">{chosen.map(d=><div key={d.id} className="min-w-0">
         <dt className="break-words text-xs text-muted-foreground">{d.name}</dt>
         <dd className="font-mono text-lg font-bold tabular-nums">{p.totals[d.id]??0} <span className="text-[10px] font-normal text-muted-foreground">pts</span></dd>
       </div>)}</dl>
     </div>)}
   </div>
   <div className="mt-4 hidden overflow-x-auto sm:block"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2">Round</th>{chosen.map(d=><th className="px-2 py-2 text-right" key={d.id}>{d.name}</th>)}</tr></thead><tbody>{series.points.map((p,i)=><tr key={i} className="border-b border-border/50"><td className="py-2">{p.round}</td>{chosen.map(d=><td key={d.id} className="px-2 py-2 text-right font-mono">{p.totals[d.id]??0}</td>)}</tr>)}</tbody></table></div></>}
 </div>
}
