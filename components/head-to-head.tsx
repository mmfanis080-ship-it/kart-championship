'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { fieldClass } from '@/components/form-styles'

export type H2HDriver = {
  id: string
  name: string
  team: string
  photo_url: string | null
  points: number
  wins: number
  podiums: number
  bestFinish: number | null
  avgFinish: number | null
  finishes: Record<string, number>
}

function Avatar({ driver }: { driver: H2HDriver }) {
  return driver.photo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={driver.photo_url} alt="" className="size-20 rounded-full border border-border object-cover md:size-24" />
  ) : (
    <div aria-hidden className="flex size-20 items-center justify-center rounded-full border border-border bg-secondary text-3xl font-black italic text-muted-foreground md:size-24">
      {driver.name.charAt(0)}
    </div>
  )
}

type Row = {
  label: string
  a: number | null
  b: number | null
  better: 'high' | 'low'
  prefix?: string
  note?: string
}

export function HeadToHead({ current, others }: { current: H2HDriver; others: H2HDriver[] }) {
  const [otherId, setOtherId] = useState(others[0]?.id)
  const other = others.find((driver) => driver.id === otherId) ?? others[0]
  if (!other) return null

  const shared = Object.keys(current.finishes).filter((raceId) => raceId in other.finishes)
  const aheadA = shared.filter((raceId) => current.finishes[raceId] < other.finishes[raceId]).length
  const aheadB = shared.filter((raceId) => other.finishes[raceId] < current.finishes[raceId]).length
  const total = current.points + other.points
  const shareA = total > 0 ? (current.points / total) * 100 : 50

  const rows: Row[] = [
    {
      label: 'Finished ahead',
      a: aheadA,
      b: aheadB,
      better: 'high',
      note: `${shared.length} shared race${shared.length === 1 ? '' : 's'}`,
    },
    { label: 'Wins', a: current.wins, b: other.wins, better: 'high' },
    { label: 'Podiums', a: current.podiums, b: other.podiums, better: 'high' },
    { label: 'Best finish', a: current.bestFinish, b: other.bestFinish, better: 'low', prefix: 'P' },
    { label: 'Avg finish', a: current.avgFinish, b: other.avgFinish, better: 'low' },
  ]

  function lead(a: number | null, b: number | null, better: 'high' | 'low') {
    if (a === null || b === null || a === b) return null
    return (better === 'high' ? a > b : a < b) ? 'a' : 'b'
  }

  return (
    <div className="overflow-hidden rounded-sm border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h3 className="text-xl font-black uppercase italic tracking-tight">Head to head</h3>
        <label className="sr-only" htmlFor="h2h-opponent">Compare with</label>
        <select
          id="h2h-opponent"
          value={other.id}
          onChange={(event) => setOtherId(event.target.value)}
          className={cn(fieldClass, 'w-auto min-w-44')}
        >
          {others.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-8 p-5 md:p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
          {[current, other].map((driver, index) => (
            <div key={driver.id} className={cn('flex flex-col items-center gap-2 text-center', index === 1 && 'col-start-3 row-start-1')}>
              <Avatar driver={driver} />
              <span className="text-lg font-black uppercase italic leading-tight tracking-tight md:text-2xl">{driver.name}</span>
              <span className="text-xs text-muted-foreground">{driver.team}</span>
            </div>
          ))}
          <span className="col-start-2 row-start-1 self-center font-mono text-xl font-bold text-muted-foreground">VS</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Points</span>
          <div className="flex gap-1" role="img" aria-label={`${current.name} ${current.points} points, ${other.name} ${other.points} points`}>
            <div className="flex h-9 min-w-14 items-center rounded-sm bg-primary px-3 font-mono text-sm font-bold tabular-nums" style={{ flex: `${shareA} 1 0%` }}>
              {current.points}
            </div>
            <div className="flex h-9 min-w-14 items-center justify-end rounded-sm bg-secondary px-3 font-mono text-sm font-bold tabular-nums" style={{ flex: `${100 - shareA} 1 0%` }}>
              {other.points}
            </div>
          </div>
        </div>

        <dl className="flex flex-col">
          {rows.map((row) => {
            const winner = lead(row.a, row.b, row.better)
            const show = (value: number | null) => (value === null ? '–' : `${row.prefix ?? ''}${value}`)
            return (
              <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-border py-4">
                <dd className={cn('font-mono text-xl font-bold tabular-nums', winner === 'a' ? 'text-primary' : 'text-muted-foreground')}>
                  {show(row.a)}
                </dd>
                <dt className="flex flex-col items-center text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {row.label}
                  {row.note && <span className="normal-case tracking-normal">{row.note}</span>}
                </dt>
                <dd className={cn('text-right font-mono text-xl font-bold tabular-nums', winner === 'b' ? 'text-primary' : 'text-muted-foreground')}>
                  {show(row.b)}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </div>
  )
}
