import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Driver } from '@/lib/championship'

const order = [1, 0, 2]
const heights = ['md:h-40', 'md:h-52', 'md:h-32']

export function Podium({ drivers }: { drivers: Driver[] }) {
  const top = drivers.slice(0, 3)
  if (top.length < 3) return null

  return (
    <ol aria-label="Top three drivers" className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
      {order.map((index, column) => {
        const driver = top[index]
        const position = index + 1
        return (
          <li
            key={driver.id}
            className={cn(
              'relative flex flex-col justify-end gap-1 overflow-hidden rounded-sm border border-border bg-card p-5',
              heights[column],
              position === 1 && 'border-primary/60 bg-gradient-to-b from-primary/20 to-card',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute -right-2 -top-6 font-mono text-8xl font-black italic',
                position === 1 ? 'text-primary/25' : 'text-foreground/5',
              )}
            >
              {position}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              P{position} · {driver.wins} {driver.wins === 1 ? 'win' : 'wins'}
            </span>
            <Link href={`/drivers/${driver.id}`} className="text-2xl font-black uppercase italic leading-none tracking-tight hover:text-primary">
              {driver.name}
            </Link>
            <span className="flex items-baseline justify-between gap-2 text-sm text-muted-foreground">
              {driver.team}
              <span className={cn('font-mono text-lg font-bold', position === 1 ? 'text-primary' : 'text-foreground')}>
                {driver.points} <span className="text-xs text-muted-foreground">PTS</span>
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
