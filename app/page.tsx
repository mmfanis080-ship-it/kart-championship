import { Calendar } from '@/components/calendar'
import { ChampionshipBattle } from '@/components/championship-battle'
import { AttendanceOverview } from '@/components/attendance-overview'
import { buildBattleSeries } from '@/lib/battle'
import { getAttendanceCounts } from '@/lib/attendance'
import { ConstructorsTable } from '@/components/constructors-table'
import { DataNotice } from '@/components/data-notice'
import { Hero } from '@/components/hero'
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
