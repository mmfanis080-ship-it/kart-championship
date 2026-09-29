import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Driver, Race } from '@/lib/championship'

export function StandingsTable({ drivers, races }: { drivers: Driver[]; races: Race[] }) {
  const leaderPoints = drivers[0]?.points ?? 0
  const completedRaces = races.filter((race) => race.completed)

  if (drivers.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
        No drivers have been entered yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Driver championship standings</caption>
        <thead>
          <tr className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <th scope="col" className="w-16 px-4 py-3 font-medium">Pos</th>
            <th scope="col" className="px-4 py-3 font-medium">Driver</th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Team</th>
            {completedRaces.map((race) => (
              <th key={race.id} scope="col" className="px-4 py-3 text-right font-medium">
                <abbr title={race.name} className="no-underline">R{race.round}</abbr>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-right font-medium">Wins</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Gap</th>
            <th scope="col" className="w-40 px-4 py-3 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver, index) => {
            const position = index + 1
            const isPodium = position <= 3
            const share = leaderPoints > 0 ? (driver.points / leaderPoints) * 100 : 0

            return (
              <tr key={driver.id} className="border-b border-border last:border-b-0 transition-colors hover:bg-accent/60">
                <td className="relative px-4 py-4">
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-y-0 left-0 w-1',
                      position === 1 ? 'bg-primary' : isPodium ? 'bg-primary/40' : 'bg-transparent',
                    )}
                  />
                  <span
                    className={cn(
                      'font-mono text-xl font-bold tabular-nums',
                      position === 1 ? 'text-primary' : isPodium ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {String(position).padStart(2, '0')}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col leading-tight">
                    <Link href={`/drivers/${driver.id}`} className="text-base font-bold uppercase tracking-tight hover:text-primary">
                      {driver.name}
                    </Link>
                    <span className="text-xs text-muted-foreground md:hidden">{driver.team}</span>
                  </div>
                </td>
                <td className="hidden px-4 py-4 text-sm text-muted-foreground md:table-cell">{driver.team}</td>
                {completedRaces.map((race) => (
                  <td key={race.id} className="px-4 py-4 text-right font-mono tabular-nums text-muted-foreground">
                    {driver.pointsByRace[race.id] ?? '–'}
                  </td>
                ))}
                <td className="px-4 py-4 text-right font-mono tabular-nums">{driver.wins}</td>
                <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {position === 1 ? 'Leader' : `-${leaderPoints - driver.points}`}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-lg font-bold tabular-nums">{driver.points}</span>
                    <span className="h-1 w-full max-w-28 overflow-hidden rounded-full bg-secondary" aria-hidden>
                      <span
                        className={cn('block h-full', position === 1 ? 'bg-primary' : 'bg-foreground/50')}
                        style={{ width: `${share}%` }}
                      />
                    </span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
