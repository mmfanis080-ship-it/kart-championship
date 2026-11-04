import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DriverCard } from '@/components/driver-card'
import { ChampionshipBattle } from '@/components/championship-battle'
import { buildBattleSeries, finishForm } from '@/lib/battle'
import { HeadToHead, type H2HDriver } from '@/components/head-to-head'
import { SectionHeading } from '@/components/section-heading'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { driverHistory, getChampionship } from '@/lib/championship'
import { formatDate } from '@/lib/format'
import { getLapSessions } from '@/lib/laps'
import { computeRatings } from '@/lib/ratings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Driver | Kart Championship' }

export default async function DriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [championship, lapSessions] = await Promise.all([getChampionship(), getLapSessions()])
  const index = championship.drivers.findIndex((driver) => driver.id === id)
  if (index === -1) notFound()

  const driver = championship.drivers[index]
  const history = driverHistory(championship, id)
  const ratings = computeRatings(id, championship.results, lapSessions, driver.name)

  const finishesByDriver = new Map<string, Record<string, number>>()
  for (const result of championship.results) {
    const finishes = finishesByDriver.get(result.driver_id) ?? {}
    finishes[result.race_id] = result.position
    finishesByDriver.set(result.driver_id, finishes)
  }
  const toH2H = (entry: (typeof championship.drivers)[number]): H2HDriver => {
    const finishes = finishesByDriver.get(entry.id) ?? {}
    const positions = Object.values(finishes)
    return {
      id: entry.id,
      name: entry.name,
      team: entry.team,
      photo_url: entry.photo_url,
      points: entry.points,
      wins: entry.wins,
      podiums: entry.podiums,
      bestFinish: entry.bestFinish,
      avgFinish: positions.length ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10 : null,
      finishes,
    }
  }
  const others = championship.drivers.filter((entry) => entry.id !== id).map(toH2H)
  const classified = history.filter(entry=>entry.position>0)
  const avgFinish = classified.length ? (classified.reduce((sum,entry)=>sum+entry.position,0)/classified.length).toFixed(1) : '–'
  const completed = championship.races.filter(r=>r.completed).length
  const recent = finishForm(id, championship.races, championship.results)
  const lapHistory = lapSessions.flatMap(session=>session.results.filter(result=>result.driver_id===id && result.best_ms>0)
    .map(result=>({ session:session.name, track:session.track, best:result.best_ms, date:session.session_date }))).sort((a,b)=>(b.date??'').localeCompare(a.date??''))
  const stats = [
    { label: 'Position', value: `P${index + 1}` },
    { label: 'Points', value: driver.points },
    { label: 'Wins', value: driver.wins },
    { label: 'Podiums', value: driver.podiums },
    { label: 'Best finish', value: driver.bestFinish ? `P${driver.bestFinish}` : '–' },
    { label: 'Average finish', value: avgFinish },
    { label: 'Classified rounds', value: completed ? `${Math.round(classified.length/completed*100)}%` : '–' },
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:px-6">
        <Link href="/#standings" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
          ← Standings
        </Link>
        <div className="grid gap-8 md:grid-cols-[340px_1fr] md:items-start">
          <DriverCard name={driver.name} team={driver.team} photoUrl={driver.photo_url} position={index + 1} ratings={ratings} />
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-2 bg-card p-5">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{stat.label}</dt>
                  <dd className="font-mono text-3xl font-bold tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
            {(ratings.pac === null || ratings.con === null) && (
              <p className="rounded-sm border border-border bg-card p-4 text-sm text-muted-foreground">
                Δεν υπάρχουν αρκετοί συνδεδεμένοι χρόνοι γύρων για το PAC ή/και το CON.
                Έλεγξε ότι τα δεδομένα του <code>lap_results</code> στο Supabase έχουν το σωστό <code>driver_id</code>.
              </p>
            )}
            <details className="rounded-sm border border-border bg-card p-4 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-semibold text-foreground">Πώς υπολογίζονται οι βαθμοί της κάρτας</summary>
              <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
                <li><b className="text-foreground">EXP</b> (εμπειρία): 45 + 6 για κάθε αγώνα που έχει τρέξει.</li>
                <li><b className="text-foreground">RAC</b> (racecraft): η μέση θέση τερματισμού σε σχέση με τους υπόλοιπους. Νίκη = το μέγιστο, τελευταίος = το ελάχιστο.</li>
                <li><b className="text-foreground">CON</b> (σταθερότητα): πόσο λίγο ξεφεύγουν οι γύροι του από τον τυπικό γύρο του. Βγαίνει από τους χρόνους γύρων.</li>
                <li><b className="text-foreground">PAC</b> (ταχύτητα): η διαφορά του καλύτερου γύρου του από τον ταχύτερο γύρο της συνεδρίας.</li>
                <li><b className="text-foreground">RTG</b> (γενικός βαθμός): RAC 40%, PAC 30%, CON 15%, EXP 15%. Όπου δεν υπάρχουν δεδομένα, το κομμάτι παραλείπεται.</li>
              </ul>
            </details>
          </div>
        </div>

        <section aria-labelledby="driver-form" className="flex flex-col gap-5">
          <SectionHeading id="driver-form" eyebrow="Season performance" title="Recent Form & Lap Sessions" />
          <div className="rounded-sm border border-border bg-card p-5"><p className="mb-3 text-xs uppercase text-muted-foreground">Last five races</p><div className="flex flex-wrap gap-2">{recent.length?recent.map((pos,i)=><span className={`rounded-sm border px-4 py-3 font-mono font-bold ${pos===1?'border-primary text-primary':'border-border'}`} key={i}>{pos?`P${pos}`:'–'}</span>):'No race results yet.'}</div></div>
          <div className="rounded-sm border border-border bg-card p-5"><p className="mb-3 text-xs uppercase text-muted-foreground">Linked lap sessions</p>{lapHistory.length?<div className="grid gap-2 sm:grid-cols-2">{lapHistory.slice(0,6).map((entry,i)=><div className="rounded-sm border border-border p-3" key={i}><p className="font-bold uppercase">{entry.track}</p><p className="text-xs text-muted-foreground">{entry.session}</p><p className="mt-2 font-mono text-lg font-bold">{(entry.best/1000).toFixed(3)}s</p></div>)}</div>:<p className="text-sm text-muted-foreground">No linked lap times. Check lap_results.driver_id in Supabase.</p>}</div>
        </section>
        <section aria-labelledby="driver-points" className="flex flex-col gap-5">
          <SectionHeading id="driver-points" eyebrow="Race by race" title="Points Progression" />
          <ChampionshipBattle drivers={[driver]} series={buildBattleSeries([driver],championship.races,championship.results)} />
        </section>
        {others.length > 0 && (
          <section aria-label="Head to head" className="flex flex-col gap-6">
            <HeadToHead key={id} current={toH2H(driver)} others={others} />
          </section>
        )}

        <section aria-labelledby="history" className="flex flex-col gap-6">
          <SectionHeading id="history" eyebrow="Season 2026" title="Race by race" />
          {history.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
              No race results yet.
            </p>
          ) : (
            <>
            <ol className="grid gap-2 sm:hidden" aria-label="Driver race history">
              {history.map(entry=>(
                <li key={entry.id} className="rounded-sm border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs uppercase text-primary">Round {entry.race.round}</p>
                      <p className="mt-1 break-words font-bold uppercase">{entry.race.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(entry.race.race_date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-lg font-bold">P{entry.position}</p>
                      <p className="font-mono text-sm text-muted-foreground">+{entry.points} pts</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="hidden overflow-x-auto rounded-sm border border-border bg-card sm:block">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th scope="col" className="px-4 py-3 font-medium">Round</th>
                    <th scope="col" className="px-4 py-3 font-medium">Race</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Finish</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">{entry.race.round}</td>
                      <td className="px-4 py-3 font-bold uppercase">{entry.race.name}</td>
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{formatDate(entry.race.race_date)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">P{entry.position}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
