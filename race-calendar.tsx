import { cn } from '@/lib/utils'
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
          <article key={race.id} className="flex flex-col gap-4 rounded-sm border border-border bg-card p-5">
            <header className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Round {String(race.round).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-black uppercase italic tracking-tight">{race.name}</h3>
              </div>
              <span
                className={cn(
                  'rounded-sm px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest',
                  race.completed ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground',
                )}
              >
                {race.completed ? 'Classified' : 'Upcoming'}
              </span>
            </header>

            {results.length > 0 ? (
              <ol className="flex flex-col divide-y divide-border" aria-label={`Round ${race.round} classification`}>
                {results.map((result) => (
                  <li key={result.id} className="flex items-center gap-4 py-2">
                    <span
                      className={cn(
                        'w-8 font-mono font-bold tabular-nums',
                        result.position === 1 ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      P{result.position}
                    </span>
                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-bold uppercase">{result.driverName}</span>
                      <span className="text-xs text-muted-foreground">{result.team}</span>
                    </span>
                    <span className="font-mono tabular-nums">
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
