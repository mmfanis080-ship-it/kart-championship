import type { Driver } from '@/lib/championship'

const TEAM_COLORS: Record<string, string> = {
  mclaren: '#ff8000', ferrari: '#ef3535', mercedes: '#18b8ab',
  porsche: '#bcbcbc', 'red bull': '#4465ff', renault: '#f4cc24',
}

/** Presentation only. Grid order is supplied by Admin / published database; nothing here can edit it. */
export function StartingGridCards({ driverIds, drivers }: { driverIds: string[]; drivers: Driver[] }) {
  const byId = new Map(drivers.map(d => [d.id, d]))
  const pairs = Array.from({ length: Math.ceil(driverIds.length / 2) }, (_, i) => driverIds.slice(i * 2, i * 2 + 2))

  return (
    <div className="space-y-6 sm:space-y-9" aria-label="Official starting grid, two drivers per row">
      {pairs.map((pair, row) => (
        <section key={row} aria-label={`Starting row ${row + 1}`} className="relative">
          <div className="mb-3 flex items-center gap-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            <span className="h-px flex-1 bg-border" />
            <span>Row {String(row + 1).padStart(2, '0')}</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-5">
            {pair.map((id, slot) => {
              const driver = byId.get(id)
              const position = row * 2 + slot + 1
              const team = driver?.team ?? 'Unknown team'
              const color = TEAM_COLORS[team.toLowerCase()] ?? '#db2638'
              const name = driver?.name ?? 'Unknown driver'
              return (
                <article key={id} className="relative isolate min-h-[230px] overflow-hidden rounded-lg border border-white/15 bg-[#101117] text-white sm:min-h-[330px] lg:min-h-[405px]" style={{ background: `linear-gradient(155deg, ${color}32 0%, #151620 47%, #090a0d 100%)` }}>
                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
                  <div className="absolute -right-3 top-6 select-none text-[7rem] font-black leading-none text-white/[0.055] sm:text-[12rem] lg:text-[15rem]" aria-hidden>{position}</div>
                  {driver?.photo_url ? (
                    // External photo URL comes from the existing driver record in Supabase.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={driver.photo_url} alt="" loading="lazy" className="absolute inset-x-0 top-4 h-[81%] w-full object-contain object-bottom" style={{ maskImage: 'linear-gradient(to bottom, black 68%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 68%, transparent 100%)' }} />
                  ) : (
                    <span className="absolute inset-x-0 top-[23%] text-center text-8xl font-black text-white/10 sm:text-[11rem]" aria-hidden>{name.charAt(0)}</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/95 to-transparent px-3 pb-4 pt-16 sm:px-6 sm:pb-6 sm:pt-28">
                    <div className="mb-1 flex items-center gap-2 sm:mb-2">
                      <span className="font-mono text-lg font-black italic leading-none sm:text-3xl lg:text-4xl" style={{ color }}>P{position}</span>
                      <span className="h-px flex-1 bg-white/25" />
                    </div>
                    <h3 className="break-words text-lg font-black uppercase italic leading-[1.02] tracking-tight sm:text-3xl lg:text-4xl">{name}</h3>
                    <p className="mt-1 truncate font-mono text-[10px] font-bold uppercase tracking-widest sm:text-xs" style={{ color }}>{team}</p>
                  </div>
                </article>
              )
            })}
            {pair.length === 1 ? <div aria-hidden className="flex min-h-[230px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-card/25 text-center text-xs uppercase tracking-widest text-muted-foreground sm:min-h-[330px]">Empty grid slot</div> : null}
          </div>
        </section>
      ))}
    </div>
  )
}
