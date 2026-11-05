'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Race } from '@/lib/championship'
import type { AttendanceCount, AttendancePublicEntry } from '@/lib/attendance'
import { raceInstant } from '@/lib/format'
import { TeamLogo } from '@/components/team-logo'
import { AttendanceQuickForm } from '@/components/driver/attendance-quick-form'

function pad(v:number) {return String(v).padStart(2, '0')}
function RaceCountdown({ race }: { race: Race }) {
  const target = raceInstant(race.race_date, race.race_time)
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])
  const remain = target !== null && now !== null ? Math.max(0, target-now) : null
  const sec = remain === null ? null : Math.floor(remain/1000)
  const units = [
    ['DAYS',sec === null ? '--' : String(Math.floor(sec/86400))],
    ['HRS',sec === null ? '--' : pad(Math.floor(sec%86400/3600))],
    ['MIN',sec === null ? '--' : pad(Math.floor(sec%3600/60))],
    ['SEC',sec === null ? '--' : pad(sec%60)],
  ]
  return <div aria-label="Time until race" className="mt-6 grid max-w-md grid-cols-4 gap-2">
    {units.map(([label, value], i) => <div key={label} className="rounded-md border border-border bg-background/60 px-1 py-3 text-center">
      <span suppressHydrationWarning className={`block font-mono text-2xl font-black tabular-nums sm:text-3xl ${i===3?'text-primary':''}`}>{value}</span>
      <span className="mt-1 block font-mono text-[9px] tracking-[0.12em] text-muted-foreground">{label}</span>
    </div>)}
  </div>
}

export function AttendanceOverview({ races, counts, roster = [], driverId = null, myChoices = {} }:{
 races:Race[];counts:AttendanceCount[];roster?:AttendancePublicEntry[];driverId?:string|null;myChoices?:Record<string,string|null>
}) {
 const upcoming = races.filter(r=>!r.completed)
 const [selectedId, setSelectedId] = useState(upcoming[0]?.id ?? '')
 const race = upcoming.find(r=>r.id===selectedId) ?? upcoming[0]
 if (!race) return <p className="rounded-md border border-border bg-card p-6 text-muted-foreground">No upcoming races yet.</p>
 const c = counts.find(c=>c.race_id===race.id)
 const everyone = roster.filter(row=>row.race_id===race.id)
 const byChoice = (choice:'yes'|'maybe'|'no') => everyone.filter(p=>p.choice===choice)
 const yes = c?.yes_count ?? byChoice('yes').length
 const maybe = c?.maybe_count ?? byChoice('maybe').length
 const no = c?.no_count ?? byChoice('no').length
 const total = Math.max(1, yes+maybe+no)
 const dated = race.race_date ? new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${race.race_date}T00:00:00Z`)) : 'Date TBA'
 const extraRaces = upcoming.length > 1
 return <div className="min-w-0 space-y-4">
   {extraRaces && <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Select upcoming race">
     {upcoming.map(r=><button key={r.id} type="button" onClick={()=>setSelectedId(r.id)} aria-pressed={race.id===r.id} className={`shrink-0 rounded-md border px-4 py-2 font-mono text-xs font-bold uppercase ${race.id===r.id?'border-primary bg-primary/10 text-primary':'border-border bg-card text-muted-foreground'}`}>Round {r.round} · {r.name}</button>)}
   </div>}
   <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
     <article className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
       <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">◉ ROUND {race.round}</p>
       <h3 className="mt-3 break-words text-3xl font-black uppercase italic tracking-tight sm:text-4xl">{race.name}</h3>
       <p className="mt-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">{race.track ?? 'Track TBA'}</p>
       <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">{dated} · {race.race_time?.slice(0,5) ?? '--:--'} Greece time</p>
       {race.details && <p className="mt-3 text-xs text-muted-foreground">{race.details}</p>}
       <RaceCountdown race={race}/>
       {race.track_image_url && <div className="mt-6 flex justify-center border-t border-border pt-4"><img src={race.track_image_url} alt={`${race.track ?? race.name} track map`} className="max-h-36 w-full object-contain" loading="lazy"/></div>}
     </article>
     <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
       <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
         <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Sign-up</p><h3 className="mt-1 text-lg font-black uppercase">Are you on the grid?</h3></div>
         {driverId ? <AttendanceQuickForm key={`${race.id}-${driverId}`} raceId={race.id} initial={myChoices[race.id]??null}/> : <Link href="/driver/login" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground">Sign in to answer</Link>}
       </div>
       <div className="border-b border-border px-4 py-4 sm:px-5">
         <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground"><span>Grid · {yes} accepted</span><span>{yes+maybe+no} responses</span></div>
         <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{width:`${100*yes/total}%`}}/></div>
       </div>
       <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
         <section aria-label="Accepted drivers"><h4 className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">✓ Accepted ({yes})</h4>
           {byChoice('yes').length ? <ul className="space-y-2">{byChoice('yes').map(p=><li key={p.driver_id} className="flex min-w-0 items-center gap-2"><TeamLogo team={p.team} size="sm"/><span className="min-w-0 break-words text-sm font-medium">{p.driver_name}</span></li>)}</ul> : <p className="text-xs text-muted-foreground">{yes ? 'Driver names will appear after the database update.' : 'No confirmed drivers yet.'}</p>}
         </section>
         <div className="space-y-5">
           <section aria-label="Declined drivers"><h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-red-400">× Declined ({no})</h4>{byChoice('no').length ? <ul className="space-y-2">{byChoice('no').map(p=><li key={p.driver_id} className="flex items-center gap-2"><TeamLogo team={p.team}/><span className="text-sm">{p.driver_name}</span></li>)}</ul> : <p className="text-xs text-muted-foreground">No declines.</p>}</section>
           <section aria-label="Maybe drivers"><h4 className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-amber-500">? Maybe ({maybe})</h4>{byChoice('maybe').length ? <ul className="space-y-2">{byChoice('maybe').map(p=><li key={p.driver_id} className="flex items-center gap-2"><TeamLogo team={p.team}/><span className="text-sm">{p.driver_name}</span></li>)}</ul> : <p className="text-xs text-muted-foreground">No pending answers.</p>}</section>
         </div>
       </div>
     </article>
   </div>
 </div>
}
