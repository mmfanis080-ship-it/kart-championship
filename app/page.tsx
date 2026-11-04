import Link from 'next/link'
import { Calendar } from '@/components/calendar'
import { ChampionshipBattle } from '@/components/championship-battle'
import { AttendanceOverview } from '@/components/attendance-overview'
import { buildBattleSeries } from '@/lib/battle'
import { getAttendanceCounts } from '@/lib/attendance'
import { ConstructorsTable } from '@/components/constructors-table'
import { DataNotice } from '@/components/data-notice'
import { Hero } from '@/components/hero'
import { ChampionshipHighlights } from '@/components/championship-highlights'
import { NextRaceCard } from '@/components/next-race-card'
import { Podium } from '@/components/podium'
import { RaceResults } from '@/components/race-calendar'
import { SectionHeading } from '@/components/section-heading'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { StandingsTable } from '@/components/standings-table'
import { classifyRace, getChampionship } from '@/lib/championship'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [championship, attendanceCounts] = await Promise.all([getChampionship(), getAttendanceCounts()])
  const { drivers, constructors, races, source } = championship
  const nextRace = races.find((race) => !race.completed)
  const classifications = Object.fromEntries(races.map((race) => [race.id, classifyRace(championship, race.id)]))

  return (
    <>
      <SiteHeader />
      <DataNotice source={source} />
      <main>
        <Hero leader={drivers[0]} runnerUp={drivers[1]} races={races} />
        <ChampionshipHighlights />

        {nextRace && (
          <section aria-label="Next race" className="mx-auto max-w-6xl px-4 pt-10 sm:pt-16 md:px-6">
            <NextRaceCard race={nextRace} />
          </section>
        )}

        <section aria-labelledby="standings" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:gap-8 sm:py-16 md:px-6">
          <SectionHeading id="standings" eyebrow="Drivers' Championship" title="Leaderboard" />
          <Podium drivers={drivers} />
          <StandingsTable drivers={drivers} races={races} results={championship.results} />
        </section>

        <section aria-labelledby="battle" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 sm:gap-6 sm:pb-16 md:px-6">
          <SectionHeading id="battle" eyebrow="Title race" title="Championship Battle" />
          <ChampionshipBattle drivers={drivers} series={buildBattleSeries(drivers,races,championship.results)} />
        </section>
        <section aria-labelledby="attendance" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 sm:gap-6 sm:pb-16 md:px-6">
          <SectionHeading id="attendance" eyebrow="Next grid" title="Race Attendance" />
          <AttendanceOverview races={races} counts={attendanceCounts} />
        </section>
        <section aria-labelledby="tools" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 sm:gap-6 sm:pb-16 md:px-6">
          <SectionHeading id="tools" eyebrow="Race day" title="Championship Tools" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: '/head-to-head', title: 'Head-to-Head', description: 'Compare two drivers, race finishes, wins and podiums.' },
              { href: '/starting-grid', title: 'Official Starting Grid', description: 'View the starting order published by Race Control.' },
            ].map(item => <Link key={item.href} href={item.href} className="flex min-h-36 flex-col justify-between gap-4 rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
              <h3 className="text-xl font-black uppercase italic">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <span className="font-mono text-xs font-bold uppercase text-primary">Open tool →</span>
            </Link>)}
          </div>
        </section>
        <section aria-labelledby="constructors" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 sm:gap-8 sm:pb-16 md:px-6">
          <SectionHeading id="constructors" eyebrow="Teams" title="Constructors" />
          <ConstructorsTable constructors={constructors} />
        </section>

        <section aria-labelledby="calendar" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 sm:gap-8 sm:pb-16 md:px-6">
          <SectionHeading id="calendar" eyebrow="2026 Season" title="Calendar" />
          <Calendar races={races} />
        </section>

        <section aria-labelledby="results" className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-12 sm:gap-8 sm:pb-20 md:px-6">
          <SectionHeading id="results" eyebrow="Round by round" title="Race Results" />
          <RaceResults races={races} classifications={classifications} />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
