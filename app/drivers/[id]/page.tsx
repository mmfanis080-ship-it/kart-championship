import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SectionHeading } from '@/components/section-heading'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { driverHistory, getChampionship } from '@/lib/championship'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Driver | Kart Championship' }

export default async function DriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const championship = await getChampionship()
  const index = championship.drivers.findIndex((driver) => driver.id === id)
  if (index === -1) notFound()

  const driver = championship.drivers[index]
  const history = driverHistory(championship, id)
  const stats = [
    { label: 'Position', value: `P${index + 1}` },
    { label: 'Points', value: driver.points },
    { label: 'Wins', value: driver.wins },
    { label: 'Podiums', value: driver.podiums },
    { label: 'Best finish', value: driver.bestFinish ? `P${driver.bestFinish}` : '–' },
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:px-6">
        <Link href="/#standings" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
          ← Standings
        </Link>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{driver.team}</p>
          <h1 className="text-5xl font-black uppercase italic leading-none tracking-tight md:text-6xl">{driver.name}</h1>
        </div>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 bg-card p-5">
              <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{stat.label}</dt>
              <dd className="font-mono text-3xl font-bold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="history" className="flex flex-col gap-6">
          <SectionHeading id="history" eyebrow="Season 2026" title="Race by race" />
          {history.length === 0 ? (
            <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
              No race results yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-sm border border-border bg-card">
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
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
