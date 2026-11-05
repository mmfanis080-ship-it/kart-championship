import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getChampionship } from '@/lib/championship'
import { createClient } from '@/lib/supabase/server'
export const dynamic='force-dynamic'
export const metadata={title:'Championship Awards | Kart Championship'}
export default async function Page(){
 const supabase=await createClient()
 const champ=await getChampionship()
 const [events,nominees]=await Promise.all([
  supabase.from('award_events').select('id,title,kind,opens_at,closes_at').eq('published',true).order('closes_at',{ascending:false}),
  supabase.from('award_nominees').select('id,award_id,driver_id,title,video_path')
 ])
 const now=Date.now()
 const complete=(events.data??[]).filter(e=>now>=new Date(e.closes_at).getTime())
 const tally=await Promise.all(complete.map(e=>supabase.rpc('award_vote_counts',{p_award_id:e.id})))
 const counts=new Map(complete.map((e,i)=>[e.id, new Map((tally[i].data??[]).map((n:{nominee_id:string;votes:number})=>[n.nominee_id,Number(n.votes)]))]))
 return <><SiteHeader/><main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
  <p className="text-xs uppercase tracking-widest text-primary">Community Awards</p><h1 className="mb-8 mt-2 text-4xl font-black uppercase italic">Awards and Votes</h1>
  <p className="mb-6 text-muted-foreground">Race Control nominates; approved drivers vote from their account. Results appear after voting closes. <Link href="/driver" className="text-primary underline">Go to my dashboard</Link></p>
  {events.error?<p>Run migration 008 to enable awards.</p>:<div className="grid gap-5 md:grid-cols-2">{(events.data??[]).map(e=>{
   const closed=now>=new Date(e.closes_at).getTime()
   const nn=(nominees.data??[]).filter(n=>n.award_id===e.id)
   const eventCounts=counts.get(e.id)
   const highest=Math.max(0,...nn.map(n=>eventCounts?.get(n.id)??0))
   return <section key={e.id} className="rounded-sm border border-border bg-card p-5">
    <p className="text-xs font-bold uppercase text-primary">{e.kind.replaceAll('_',' ')}</p><h2 className="my-2 text-2xl font-black uppercase">{e.title}</h2>
    <p className="mb-4 text-xs text-muted-foreground">{closed?'Voting ended':'Voting closes'} {new Date(e.closes_at).toLocaleDateString('en-GB')}</p>
    <div className="space-y-4">{nn.map(n=>{
      const votes=eventCounts?.get(n.id)??0
      const winner=closed&&highest>0&&votes===highest
      return <div key={n.id} className={`rounded-sm border p-3 ${winner?'border-amber-400/70':'border-border'}`}><p className="mb-2 font-bold">{winner?'🏆 ':''}{champ.drivers.find(d=>d.id===n.driver_id)?.name??'Driver'} {n.title&&`· ${n.title}`}</p>
       {n.video_path&&<video src={supabase.storage.from('kart-overtakes').getPublicUrl(n.video_path).data.publicUrl} controls playsInline preload="none" className="aspect-video w-full bg-black"/>}
       {closed&&<p className="mt-2 text-sm text-muted-foreground">{votes} {votes===1?'vote':'votes'} {winner?'· Winner / tied first':''}</p>}
      </div>
    })}</div>
    <p className="mt-4 text-xs text-muted-foreground">{closed?(highest?'Final votes counted':'No votes were cast.'):'Log in to cast your private vote.'}</p>
   </section>
  })}</div>}
 </main><SiteFooter/></>
}
