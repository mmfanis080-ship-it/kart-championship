import type { Race } from '@/lib/championship'
import type { AttendanceCount } from '@/lib/attendance'
import { formatDate } from '@/lib/format'
export function AttendanceOverview({races,counts}:{races:Race[];counts:AttendanceCount[]}){
 const upcoming=races.filter(r=>!r.completed),byId=new Map(counts.map(r=>[r.race_id,r]))
 return <div><p className="mb-4 text-sm text-muted-foreground">Προσωπικοί σύνδεσμοι συμμετοχής στέλνονται από το Admin σε κάθε οδηγό.</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map(r=>{const c=byId.get(r.id);return <div key={r.id} className="rounded-sm border border-border bg-card p-5"><p className="font-mono text-xs uppercase text-primary">Round {r.round}</p><h3 className="mt-2 text-xl font-black uppercase">{r.name}</h3><p className="mt-2 text-sm text-muted-foreground">{r.track??'TBC'} · {formatDate(r.race_date)}</p><div className="mt-4 grid grid-cols-3 border-t border-border pt-4 text-center">{([['YES',c?.yes_count??0],['MAYBE',c?.maybe_count??0],['NO',c?.no_count??0]] as const).map(([name,n])=><div key={name}><p className="font-mono text-xl font-bold">{n}</p><p className="font-mono text-[10px] text-muted-foreground">{name}</p></div>)}</div></div>})}</div>{!upcoming.length&&<p className="rounded-sm border border-border p-5">No upcoming races yet.</p>}</div>
}
