'use client'

import { useEffect, useState } from 'react'
import type { Race } from '@/lib/championship'
import { formatDayMonth, raceInstant } from '@/lib/format'

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function NextRaceCard({ race }: { race: Race }) {
  const target = raceInstant(race.race_date, race.race_time)
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const left = target !== null && now !== null ? parts(target - now) : null
  const started = target !== null && now !== null && target <= now
  const units = [
    { label: 'Days', value: left?.days },
    { label: 'Hrs', value: left?.hours },
    { label: 'Min', value: left?.minutes },
    { label: 'Sec', value: left?.seconds },
  ]

  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-card">
      <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.3em]">
            <span className="text-primary">Next race</span>
            <span className="text-muted-foreground">Round {race.round}</span>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-4xl font-black uppercase italic leading-none tracking-tight md:text-5xl">{race.name}</h3>
            {race.track && <p className="text-sm text-muted-foreground">{race.track}</p>}
            {race.details && (
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{race.details}</p>
            )}
          </div>
        </div>
        {race.track_image_url && (
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={race.track_image_url} alt={`${race.track ?? race.name} layout`} className="max-h-44 w-full object-contain opacity-90" />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background/40 p-6 md:px-8">
        {target !== null ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-2 md:max-w-md">
              {units.map((unit, index) => (
                <div key={unit.label} className="flex flex-col items-center gap-1 rounded-sm border border-border bg-card py-3">
                  <span
                    className={`font-mono text-3xl font-bold tabular-nums md:text-4xl ${index === 3 ? 'text-primary' : ''}`}
                    suppressHydrationWarning
                  >
                    {unit.value === undefined ? '--' : String(unit.value).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{unit.label}</span>
                </div>
              ))}
            </div>
            <p className="font-mono text-sm uppercase tracking-widest">
              {started ? 'Race day' : <>{formatDayMonth(race.race_date as string)} <span className="text-muted-foreground">|</span> {race.race_time?.slice(0, 5)} <span className="text-muted-foreground">Athens time</span></>}
            </p>
          </div>
        ) : (
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Date and time to be confirmed</p>
        )}
      </div>
    </div>
  )
}
