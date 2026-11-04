import { cn } from '@/lib/utils'
import type { Constructor } from '@/lib/championship'

export function ConstructorsTable({ constructors }: { constructors: Constructor[] }) {
  if (constructors.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
        No teams yet.
      </p>
    )
  }
  const leaderPoints = constructors[0].points

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-card">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="sr-only">Constructors championship standings</caption>
        <thead>
          <tr className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <th scope="col" className="w-16 px-4 py-3 font-medium">Pos</th>
            <th scope="col" className="px-4 py-3 font-medium">Team</th>
            <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Drivers</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Wins</th>
            <th scope="col" className="w-40 px-4 py-3 text-right font-medium">Points</th>
          </tr>
        </thead>
        <tbody>
          {constructors.map((team, index) => {
            const position = index + 1
            const share = leaderPoints > 0 ? (team.points / leaderPoints) * 100 : 0
            return (
              <tr key={team.team} className="border-b border-border last:border-b-0 hover:bg-accent/60">
                <td className="px-4 py-4">
                  <span className={cn('font-mono text-xl font-bold tabular-nums', position === 1 ? 'text-primary' : 'text-muted-foreground')}>
                    {String(position).padStart(2, '0')}
                  </span>
                </td>
                <td className="px-4 py-4 text-base font-bold uppercase tracking-tight">{team.team}</td>
                <td className="hidden px-4 py-4 text-sm text-muted-foreground md:table-cell">{team.drivers.join(', ')}</td>
                <td className="px-4 py-4 text-right font-mono tabular-nums">{team.wins}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-lg font-bold tabular-nums">{team.points}</span>
                    <span className="h-1 w-full max-w-28 overflow-hidden rounded-full bg-secondary" aria-hidden>
                      <span className={cn('block h-full', position === 1 ? 'bg-primary' : 'bg-foreground/50')} style={{ width: `${share}%` }} />
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
