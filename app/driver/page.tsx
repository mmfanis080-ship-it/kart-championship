import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DriverAttendanceForm } from '@/components/driver/attendance-form'
import { AwardVoteForm } from '@/components/driver/award-vote-form'
import { ChangeDriverPassword } from '@/components/driver/change-password'
import { getChampionship } from '@/lib/championship'
import { getDriverAchievements } from '@/lib/achievements'
import { requireDriverSession } from '@/lib/driver-session'
import { signOutDriver } from './actions'

export const dynamic='force-dynamic'
export const metadata={title:'My Driver Dashboard | Kart Championship'}
type EventRow={id:string;title:string;kind:string;opens_at:string;closes_at:string}
type Nominee={id:string;award_id:string;driver_id:string;title:string;video_path:string|null}
export default async function Page(){
 const {supabase,driverId}=await requireDriverSession()
 const champ=await getChampionship()
 const current=champ.drivers.find(d=>d.id===driverId)
 const races=champ.races.filter(r=>!r.completed)
 const [entries,events,nominees,votes]=await Promise.all([
  supabase.from('attendance_entries').select('race_id,choice').eq('driver_id',driverId),
  supabase.from('award_events').select('id,title,kind,opens_at,closes_at').eq('published',true).order('closes_at',{ascending:false}),
  supabase.from('award_nominees').select('id,award_id,driver_id,title,video_path'),
  supabase.from('award_votes').select('award_id,nominee_id').eq('voter_id',driverId),
 ])
 const entriesMap=new Map((entries.data??[]).map(e=>[e.race_id,e.choice]))
 const nomineeRows=(nominees.data??[]) as Nominee[]
 const votesMap=new Map((votes.data??[]).map(v=>[v.award_id,v.nominee_id]))
 const achievements=getDriverAchievements(driverId,champ.races,champ.results)
 const now=Date.now()
 return <><SiteHeader/><main className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6">
  <form action={signOutDriver} className="flex justify-end"><button type="submit" className="min-h-11 rounded-sm border border-border px-4 text-sm font-bold">Sign out</button></form>
  <div><p className="font-mono text-xs uppercase tracking-widest text-primary">My paddock</p><h1 className="mt-2 text-3xl font-black uppercase italic sm:text-5xl">Welcome, {current?.name??'Driver'}</h1><p className="mt-2 text-sm text-muted-foreground">{current?.team} · <Link className="underline" href="/awards">Awards gallery</Link></p></div>
  <ChangeDriverPassword />
  <section><h2 className="mb-4 text-2xl font-black uppercase italic">Race attendance</h2>{races.length?<div className="grid gap-4 sm:grid-cols-2">{races.map(r=><div key={r.id}><h3 className="mb-2 text-lg font-bold">R{r.round} · {r.name}</h3><p className="mb-3 text-xs text-muted-foreground">{r.race_date??'Date TBA'}</p><DriverAttendanceForm raceId={r.id} initial={entriesMap.get(r.id)??null}/></div>)}</div>:<p className="text-muted-foreground">No upcoming races.</p>}</section>
  <section><h2 className="mb-4 text-2xl font-black uppercase italic">My achievements</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{achievements.map(a=><div key={a.key} className={`rounded-sm border p-4 ${a.unlocked?'border-amber-500/50 bg-amber-500/5':'border-border bg-card opacity-65'}`}><div className="text-2xl">{a.unlocked?'🏆':'🔒'}</div><h3 className="mt-2 font-bold">{a.title}</h3><p className="mt-1 text-xs text-muted-foreground">{a.description}</p><p className="mt-3 font-mono text-xs">{Math.min(a.progress,a.target)} / {a.target}</p></div>)}</div></section>
  <section><h2 className="mb-4 text-2xl font-black uppercase italic">Vote for awards</h2>{events.error?<p>Run database migration 008 to enable awards.</p>:!(events.data??[]).length?<p className="text-muted-foreground">No awards published yet.</p>:<div className="grid gap-5 sm:grid-cols-2">{((events.data??[]) as EventRow[]).map(e=>{const active=now>=new Date(e.opens_at).getTime()&&now<new Date(e.closes_at).getTime();const nn=nomineeRows.filter(n=>n.award_id===e.id);return <div key={e.id} className="rounded-sm border border-border bg-card p-4"><p className="mb-2 text-xs uppercase tracking-widest text-primary">{e.kind==='driver_of_the_day'?'Driver of the Day':'Overtake of the Month'}</p><h3 className="mb-2 text-xl font-black">{e.title}</h3><p className="mb-3 text-xs text-muted-foreground">Closes {new Date(e.closes_at).toLocaleDateString('en-GB')}</p>{nn.map(n=>n.video_path?<video key={n.id} controls preload="none" playsInline className="mb-2 aspect-video w-full rounded-sm bg-black" src={supabase.storage.from('kart-overtakes').getPublicUrl(n.video_path).data.publicUrl}/>:null)}{active?<AwardVoteForm awardId={e.id} chosen={votesMap.get(e.id)??null} nominees={nn.map(n=>({id:n.id,name:champ.drivers.find(d=>d.id===n.driver_id)?.name??'Driver'}))}/>:<p className="text-sm text-muted-foreground">Voting is {now<new Date(e.opens_at).getTime()?'not open yet':'closed'}.</p>}</div>})}</div>}</section>
 </main><SiteFooter/></>
}
