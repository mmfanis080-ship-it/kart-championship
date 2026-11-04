'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { LapResult, LapSession } from '@/lib/laps'

const COLOR_A = '#e10600'
const COLOR_B = '#a3e635'

function formatLap(ms: number) {
  const minutes = Math.floor(ms / 60000)
  return `${minutes}:${((ms - minutes * 60000) / 1000).toFixed(3).padStart(6, '0')}`
}
const formatSector = (ms: number) => (ms / 1000).toFixed(3)
const formatGap = (ms: number) => `+${(ms / 1000).toFixed(3)}`
function formatDelta(ms: number) {
  if (ms === 0) return '±0.000'
  return `${ms < 0 ? '−' : '+'}${(Math.abs(ms) / 1000).toFixed(3)}`
}
function formatDate(value: string | null) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

// Lap 1 on the timing sheet is the time since the session started, not a real lap, so it is skipped.
const flyingLaps = (result: LapResult) => (result.laps_ms ?? []).slice(1)

function stats(result: LapResult) {
  const laps = flyingLaps(result)
  if (laps.length === 0) return null
  const avg = laps.reduce((sum, value) => sum + value, 0) / laps.length
  const spread = Math.sqrt(laps.reduce((sum, value) => sum + (value - avg) ** 2, 0) / laps.length)
  return { avg, spread, count: laps.length }
}

function Avatar({ result, size = 'size-8' }: { result: LapResult; size?: string }) {
  return result.photo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={result.photo_url} alt="" className={cn(size, 'shrink-0 rounded-full border border-border object-cover')} />
  ) : (
    <span aria-hidden className={cn(size, 'flex shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-black text-muted-foreground')}>
      {result.driver_name.charAt(0)}
    </span>
  )
}

function LapChart({ a, b }: { a: LapResult; b: LapResult }) {
  const series = [
    { result: a, color: COLOR_A, laps: flyingLaps(a) },
    { result: b, color: COLOR_B, laps: flyingLaps(b) },
  ]
  const all = series.flatMap((item) => item.laps)
  const count = Math.max(...series.map((item) => item.laps.length))
  const min = Math.min(...all)
  const max = Math.max(...all)
  const pad = (max - min) * 0.12 || 500
  const lo = min - pad
  const hi = max + pad
  const W = 640, H = 240, L = 58, R = 14, T = 14, B = 30
  const x = (i: number) => L + (count <= 1 ? 0 : (i / (count - 1)) * (W - L - R))
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (H - T - B)
  const ticks = [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-[560px] max-w-none sm:w-full" role="img" aria-label={`Lap by lap: ${a.driver_name} against ${b.driver_name}`}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={L - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.6}>{formatLap(Math.round(tick))}</text>
        </g>
      ))}
      {Array.from({ length: count }, (_, i) => (
        <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>{i + 2}</text>
      ))}
      {series.map((item) => (
        <g key={item.result.id}>
          <polyline fill="none" stroke={item.color} strokeWidth={2.5} strokeLinejoin="round" points={item.laps.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {item.laps.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={v === Math.min(...item.laps) ? 5 : 3} fill={item.color} />
          ))}
        </g>
      ))}
    </svg>
  )
}

export function LapComparison({ sessions }: { sessions: LapSession[] }) {
  const [sessionId, setSessionId] = useState(sessions[0].id)
  const session = sessions.find((item) => item.id === sessionId) ?? sessions[0]
  const results = session.results
  const [aId, setAId] = useState<string | undefined>(results[0]?.id)
  const [bId, setBId] = useState<string | undefined>(results[1]?.id)
  const a = results.find((item) => item.id === aId)
  const b = results.find((item) => item.id === bId)
  const fastest = results[0]?.best_ms ?? 0

  function chooseSession(id: string) {
    const next = sessions.find((item) => item.id === id)
    setSessionId(id)
    setAId(next?.results[0]?.id)
    setBId(next?.results[1]?.id)
  }
  function pickA(id: string) {
    if (id === bId) setBId(aId)
    setAId(id)
  }
  function pickB(id: string) {
    if (id === aId) setAId(bId)
    setBId(id)
  }

  const sectors: { label: string; key: 's1_ms' | 's2_ms' | 's3_ms' }[] = [
    { label: 'Sector 1', key: 's1_ms' },
    { label: 'Sector 2', key: 's2_ms' },
    { label: 'Sector 3', key: 's3_ms' },
  ]
  const hasSectors = a && b && sectors.every(({ key }) => a[key] !== null && b[key] !== null)
  const ideal = hasSectors
    ? sectors.reduce((sum, { key }) => sum + Math.min(a[key] as number, b[key] as number), 0)
    : null
  const statsA = a ? stats(a) : null
  const statsB = b ? stats(b) : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        {sessions.length > 1 && (
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Session">
            {sessions.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item.id === session.id}
                onClick={() => chooseSession(item.id)}
                className={cn(
                  'rounded-sm border px-4 py-2 text-sm font-bold',
                  item.id === session.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {session.name} · {session.track}
          {session.session_date && ` · ${formatDate(session.session_date)}`} · {results.length} drivers
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-4">
        {a ? (
          <span className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
            <span className="flex size-5 items-center justify-center rounded-sm text-[11px] font-black text-white" style={{ background: COLOR_A }}>A</span>
            <span className="font-bold uppercase">{a.driver_name}</span>
            <span className="font-mono tabular-nums">{formatLap(a.best_ms)}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Διάλεξε A</span>
        )}
        {a && b && (
          <span className="font-mono text-lg font-bold tabular-nums" style={{ color: a.best_ms <= b.best_ms ? COLOR_A : COLOR_B }}>
            {formatDelta(a.best_ms - b.best_ms)}
          </span>
        )}
        {b ? (
          <span className="flex items-center gap-2 rounded-sm border border-border px-3 py-2">
            <span className="flex size-5 items-center justify-center rounded-sm text-[11px] font-black text-black" style={{ background: COLOR_B }}>B</span>
            <span className="font-bold uppercase">{b.driver_name}</span>
            <span className="font-mono tabular-nums">{formatLap(b.best_ms)}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Διάλεξε B</span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {ideal !== null && (
            <span>Best of both <span className="font-mono font-bold text-foreground tabular-nums">{formatLap(ideal)}</span></span>
          )}
          {a && b && (
            <button
              type="button"
              onClick={() => { setAId(bId); setBId(aId) }}
              className="rounded-sm border border-border px-3 py-2 font-semibold text-foreground hover:border-primary hover:text-primary"
            >
              Swap A / B
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:hidden" aria-label="Best laps on mobile">
        {results.map((row,index)=>(
          <article key={row.id} className={cn('rounded-sm border border-border bg-card p-3', row.id===aId&&'border-[#e10600]/70',row.id===bId&&'border-[#a3e635]/70')}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-6 shrink-0 font-mono text-sm text-muted-foreground">{index+1}</span>
              <Avatar result={row}/>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-bold uppercase">{row.driver_name}</p>
                {row.kart!==null&&<p className="text-[11px] text-muted-foreground">Kart {row.kart}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-base font-bold tabular-nums">{formatLap(row.best_ms)}</p>
                <p className="font-mono text-xs text-muted-foreground">{row.best_ms===fastest?'Fastest lap':formatGap(row.best_ms-fastest)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <div className="flex gap-3">
                <label className="flex min-h-11 items-center gap-1.5 text-xs font-bold"><input type="radio" name="lap-a-mobile" checked={row.id===aId} onChange={()=>pickA(row.id)} aria-label={`Compare ${row.driver_name} as A`} className="size-5" style={{accentColor:COLOR_A}}/> A</label>
                <label className="flex min-h-11 items-center gap-1.5 text-xs font-bold"><input type="radio" name="lap-b-mobile" checked={row.id===bId} onChange={()=>pickB(row.id)} aria-label={`Compare ${row.driver_name} as B`} className="size-5" style={{accentColor:COLOR_B}}/> B</label>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{sectors.filter(({key})=>row[key]!==null).map(({label,key})=>`${label.slice(-1)}: ${formatSector(row[key] as number)}`).join(' · ')}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-sm border border-border bg-card sm:block">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="sr-only">Best laps of the session</caption>
          <thead>
            <tr className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <th scope="col" className="w-10 px-3 py-3 font-medium">#</th>
              <th scope="col" className="w-10 px-2 py-3 text-center font-medium">A</th>
              <th scope="col" className="w-10 px-2 py-3 text-center font-medium">B</th>
              <th scope="col" className="px-3 py-3 font-medium">Driver</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Lap</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Gap</th>
              {sectors.map(({ label }) => (
                <th key={label} scope="col" className="hidden px-3 py-3 text-right font-medium md:table-cell">{label.replace('ector ', '')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border last:border-b-0',
                  row.id === aId && 'bg-[#e10600]/10',
                  row.id === bId && 'bg-[#a3e635]/10',
                )}
              >
                <td className="px-3 py-3 font-mono tabular-nums text-muted-foreground">{index + 1}</td>
                <td className="px-2 py-3 text-center">
                  <input type="radio" name="lap-a" checked={row.id === aId} onChange={() => pickA(row.id)} aria-label={`${row.driver_name} as A`} className="size-4" style={{ accentColor: COLOR_A }} />
                </td>
                <td className="px-2 py-3 text-center">
                  <input type="radio" name="lap-b" checked={row.id === bId} onChange={() => pickB(row.id)} aria-label={`${row.driver_name} as B`} className="size-4" style={{ accentColor: COLOR_B }} />
                </td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar result={row} />
                    <span className="font-bold uppercase">{row.driver_name}</span>
                    {row.kart !== null && <span className="hidden font-mono text-xs text-muted-foreground sm:inline">Kart {row.kart}</span>}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold tabular-nums">{formatLap(row.best_ms)}</td>
                <td className="px-3 py-3 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {row.best_ms === fastest ? 'Best' : formatGap(row.best_ms - fastest)}
                </td>
                {sectors.map(({ key }) => (
                  <td key={key} className="hidden px-3 py-3 text-right font-mono text-sm tabular-nums text-muted-foreground md:table-cell">
                    {row[key] === null ? '–' : formatSector(row[key] as number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {a && b && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">At a glance</h2>

          {hasSectors && (
            <div className="grid gap-3 md:grid-cols-3">
              {sectors.map(({ label, key }) => {
                const av = a[key] as number
                const bv = b[key] as number
                const delta = av - bv
                return (
                  <div key={key} className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
                      <span className="font-mono text-sm font-bold tabular-nums" style={{ color: delta <= 0 ? COLOR_A : COLOR_B }}>{formatDelta(delta)}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono tabular-nums">
                      <span className={cn('text-xl', delta <= 0 ? 'font-bold' : 'text-muted-foreground')}>{formatSector(av)}</span>
                      <span className={cn('text-xl', delta >= 0 ? 'font-bold' : 'text-muted-foreground')}>{formatSector(bv)}</span>
                    </div>
                    <div className="flex h-1.5 gap-1" aria-hidden>
                      <span className="rounded-full" style={{ background: COLOR_A, flex: delta <= 0 ? 3 : 1 }} />
                      <span className="rounded-full" style={{ background: COLOR_B, flex: delta >= 0 ? 3 : 1 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {statsA && statsB ? (
            <div className="flex flex-col gap-6 rounded-sm border border-border bg-card p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Lap by lap</h3>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <span className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: COLOR_A }} />{a.driver_name}</span>
                  <span className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: COLOR_B }} />{b.driver_name}</span>
                </div>
              </div>
              <div className="min-w-0 overflow-x-auto" tabIndex={0} aria-label="Lap chart, scroll horizontally on mobile">
                <p className="mb-2 font-mono text-[10px] uppercase text-muted-foreground sm:hidden">Swipe sideways to inspect lap times →</p>
                <LapChart a={a} b={b} />
              </div>
              <dl className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-0">
                {[
                  { label: 'Average lap', av: formatLap(Math.round(statsA.avg)), bv: formatLap(Math.round(statsB.avg)), lead: statsA.avg === statsB.avg ? null : statsA.avg < statsB.avg ? 'a' : 'b' },
                  { label: 'Consistency (±)', av: `${(statsA.spread / 1000).toFixed(3)} s`, bv: `${(statsB.spread / 1000).toFixed(3)} s`, lead: statsA.spread === statsB.spread ? null : statsA.spread < statsB.spread ? 'a' : 'b' },
                  { label: 'Laps counted', av: String(statsA.count), bv: String(statsB.count), lead: null },
                ].map((row) => (
                  <div key={row.label} className="col-span-3 grid grid-cols-subgrid items-center border-t border-border py-3">
                    <dd className={cn('font-mono text-lg font-bold tabular-nums', row.lead === 'a' ? 'text-primary' : 'text-muted-foreground')}>{row.av}</dd>
                    <dt className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{row.label}</dt>
                    <dd className={cn('text-right font-mono text-lg font-bold tabular-nums', row.lead === 'b' ? 'text-primary' : 'text-muted-foreground')}>{row.bv}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-muted-foreground">
                Ο πρώτος γύρος της λίστας είναι ο χρόνος από την αρχή της συνεδρίας και δεν μετράει. Η σταθερότητα είναι η τυπική απόκλιση των γύρων (μικρότερο = πιο σταθερός).
              </p>
            </div>
          ) : (
            <p className="rounded-sm border border-dashed border-border p-6 text-sm text-muted-foreground">
              Δεν υπάρχουν χρόνοι ανά γύρο για έναν από τους δύο οδηγούς, οπότε δεν μπορεί να βγει το γράφημα.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
