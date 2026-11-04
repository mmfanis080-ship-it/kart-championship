import { cn } from '@/lib/utils'
import { TeamLogo } from '@/components/team-logo'
import type { ClassifiedResult, Race } from '@/lib/championship'

type RaceResultsProps = {
  races: Race[]
  classifications: Record<string, ClassifiedResult[]>
}

export function RaceResults({ races, classifications }: RaceResultsProps) {
  if (races.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
        No rounds have been added yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {races.map((race) => {
        const results = classifications[race.id] ?? []
        return (
          <article key={race.id} className="flex min-w-0 flex-col gap-4 rounded-sm border border-border bg-card p-3 sm:p-5">
            <header className="flex min-w-0 items-start justify-between gap-2 sm:items-center sm:gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Round {String(race.round).padStart(2, '0')}
                </span>
                <h3 className="break-words text-lg font-black uppercase italic tracking-tight sm:text-xl">{race.name}</h3>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-sm px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest',
                  race.completed ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground',
                )}
              >
                {race.completed ? 'Classified' : 'Upcoming'}
              </span>
            </header>

            {results.length > 0 ? (
              <ol className="flex flex-col divide-y divide-border" aria-label={`Round ${race.round} classification`}>
                {results.map((result) => (
                  <li key={result.id} className="flex min-w-0 items-center gap-2 py-2 sm:gap-4">
                    <span
                      className={cn(
                        'w-8 font-mono font-bold tabular-nums',
                        result.position === 1 ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      P{result.position}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="break-words font-bold uppercase">{result.driverName}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground"><TeamLogo team={result.team}/>{result.team}</span>
                    </span>
                    <span className="shrink-0 font-mono text-sm tabular-nums sm:text-base">
                      +{result.points} <span className="text-xs text-muted-foreground">PTS</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Results will appear here after the race.</p>
            )}
          </article>
        )
      })}
    </div>
  )
}
