import { cn } from '@/lib/utils'
import type { Race } from '@/lib/championship'
import { formatDate } from '@/lib/format'

export function Calendar({ races }: { races: Race[] }) {
  if (races.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
        No rounds have been added yet.
      </p>
    )
  }
  const next = races.find((race) => !race.completed)

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {races.map((race) => (
        <li
          key={race.id}
          className={cn(
            'flex flex-col gap-2 rounded-sm border bg-card p-4',
            race.id === next?.id ? 'border-primary/60' : 'border-border',
            race.completed && 'opacity-70',
          )}
        >
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Round {String(race.round).padStart(2, '0')}
            {race.id === next?.id && <span className="ml-2 text-primary">Next</span>}
          </span>
          <span className="text-lg font-black uppercase italic leading-tight tracking-tight">{race.name}</span>
          <span className="text-sm text-muted-foreground">{race.track ?? 'Track TBC'}</span>
          <span className="font-mono text-sm tabular-nums">{formatDate(race.race_date)}</span>
        </li>
      ))}
    </ol>
  )
}
