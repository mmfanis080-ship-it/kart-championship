import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { RaceDayDriverVote } from '@/components/race-day-driver-vote'
import { getChampionship } from '@/lib/championship'
import { getDriverSession } from '@/lib/driver-session'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Championship Awards | Kart Championship' }

export default async function Page() {
  const [session, champ] = await Promise.all([getDriverSession(), getChampionship()])
  const { supabase, driverId } = session
  const [events, nominees, myVotes] = await Promise.all([
    supabase.from('award_events').select('id,title,kind,opens_at,closes_at').eq('published', true).order('closes_at', { ascending: false }),
    supabase.from('award_nominees').select('id,award_id,driver_id,title,video_path'),
    driverId ? supabase.from('award_votes').select('award_id,nominee_id').eq('voter_id', driverId) : Promise.resolve({ data: [], error: null }),
  ])
  const voteByAward = new Map((myVotes.data ?? []).map(v => [v.award_id, v.nominee_id]))
  const now = Date.now()
  const closed = (events.data ?? []).filter(e => now >= Date.parse(e.closes_at))
  const tallies = await Promise.all(closed.map(e => supabase.rpc('award_vote_counts', { p_award_id: e.id })))
  const counts = new Map(closed.map((event, i) => [event.id, new Map((tallies[i].data ?? []).map((vote: { nominee_id: string; votes: number }) => [vote.nominee_id, Number(vote.votes)]))]))

  return <><SiteHeader /><main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
    <p className="text-xs uppercase tracking-widest text-primary">Community Awards</p>
    <h1 className="mb-6 mt-2 text-3xl font-black uppercase italic sm:text-4xl">Awards and Votes</h1>
    <p className="mb-8 text-muted-foreground">Race Control nominates; approved drivers vote from their account. Results appear after voting closes. <Link href="/driver" className="text-primary underline">My dashboard</Link></p>
    {events.error ? <p role="alert">Awards could not be loaded. Check migration 008.</p> :
      <div className="space-y-8">{(events.data ?? []).map(e => {
        const nn = (nominees.data ?? []).filter(n => n.award_id === e.id)
        const isOpen = now >= Date.parse(e.opens_at) && now < Date.parse(e.closes_at)
        const isClosed = now >= Date.parse(e.closes_at)
        const eventCounts = counts.get(e.id)
        const highest = Math.max(0, ...nn.map(n => eventCounts?.get(n.id) ?? 0))
        if (e.kind === 'driver_of_the_day') {
          const candidates = nn.flatMap(n => {
            const driver = champ.drivers.find(d => d.id === n.driver_id)
            return driver ? [{ id: n.id, name: driver.name, team: driver.team, photoUrl: driver.photo_url, title: n.title ?? null }] : []
          })
          return <div key={e.id} className="space-y-3"><RaceDayDriverVote
            awardId={e.id} title={e.title} raceName={e.title}
            candidates={candidates} signedIn={Boolean(driverId)} chosen={voteByAward.get(e.id) ?? null} active={isOpen}
          />{isClosed && <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">Final votes: {candidates.map(candidate => `${candidate.name} ${eventCounts?.get(candidate.id) ?? 0}`).join(' · ')}</div>}</div>
        }
        return <section key={e.id} className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs font-bold uppercase text-primary">Overtake of the Month</p>
          <h2 className="mb-2 mt-2 text-2xl font-black uppercase">{e.title}</h2>
          <p className="mb-4 text-xs text-muted-foreground">{isClosed ? 'Voting ended' : 'Voting closes'} {new Date(e.closes_at).toLocaleDateString('en-GB')}</p>
          <div className="grid gap-4 sm:grid-cols-2">{nn.map(n => {
            const driver = champ.drivers.find(d => d.id === n.driver_id)
            const votes = eventCounts?.get(n.id) ?? 0
            return <article key={n.id} className="overflow-hidden rounded-md border border-border">
              <div className="p-3"><p className="text-lg font-black uppercase">{driver?.name ?? 'Driver'}</p>{n.title && <p className="text-sm text-muted-foreground">{n.title}</p>}</div>
              {n.video_path && <video controls playsInline preload="metadata" className="aspect-video w-full bg-black" src={supabase.storage.from('kart-overtakes').getPublicUrl(n.video_path).data.publicUrl} />}
              {isClosed && <p className="p-3 text-sm">{votes} {votes === 1 ? 'vote' : 'votes'}{highest > 0 && votes === highest ? ' · Winner / tied first' : ''}</p>}
            </article>
          })}</div>
          <p className="mt-4 text-xs text-muted-foreground">{isClosed ? 'Final result' : 'Sign in to vote from your driver dashboard.'}</p>
          {!isClosed && <Link className="mt-2 inline-block font-bold text-primary underline" href="/driver">Open voting dashboard</Link>}
        </section>
      })}</div>}
  </main><SiteFooter /></>
}
