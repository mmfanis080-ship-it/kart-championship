import Image from 'next/image'
import { Flag, Trophy } from 'lucide-react'
import type { Driver, Race } from '@/lib/championship'
import { formatDate } from '@/lib/format'

type HeroProps = {
  leader?: Driver
  runnerUp?: Driver
  races: Race[]
}

export function Hero({ leader, runnerUp, races }: HeroProps) {
  const completed = races.filter((race) => race.completed).length
  const nextRace = races.find((race) => !race.completed)
  const gap = leader && runnerUp ? leader.points - runnerUp.points : 0

  return (
    <section className="relative overflow-hidden border-b border-border">
      <Image
        src="/images/kart-hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right opacity-60"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/10" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:px-6 md:py-24">
        <div className="flex max-w-2xl flex-col gap-5">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-px w-8 bg-primary" aria-hidden />
            {completed} {completed === 1 ? 'round' : 'rounds'} classified
          </p>
          <h1 className="text-balance text-5xl font-black uppercase italic leading-[0.9] tracking-tight md:text-7xl">
            Driver <span className="text-primary">Standings</span>
          </h1>
          <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            Every point, every podium, every overtake. Follow the fight for the 2026 Kart Championship title
            round by round.
          </p>
        </div>

        <dl className="grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
          <div className="flex flex-col gap-2 bg-card/90 p-5">
            <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <Trophy className="size-3.5 text-primary" aria-hidden />
              Championship leader
            </dt>
            <dd className="text-xl font-bold leading-tight">{leader?.name ?? 'TBD'}</dd>
            {leader && <dd className="font-mono text-sm text-muted-foreground">{leader.points} PTS</dd>}
          </div>
          <div className="flex flex-col gap-2 bg-card/90 p-5">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Gap to P2</dt>
            <dd className="font-mono text-3xl font-bold text-primary">+{gap}</dd>
            {runnerUp && <dd className="text-sm text-muted-foreground">over {runnerUp.name}</dd>}
          </div>
          <div className="flex flex-col gap-2 bg-card/90 p-5">
            <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <Flag className="size-3.5 text-primary" aria-hidden />
              Next race
            </dt>
            <dd className="text-xl font-bold leading-tight">{nextRace?.name ?? 'Season complete'}</dd>
            {nextRace && (
              <dd className="font-mono text-sm uppercase text-muted-foreground">Round {nextRace.round} · {formatDate(nextRace.race_date)}</dd>
            )}
          </div>
        </dl>
      </div>
    </section>
  )
}
