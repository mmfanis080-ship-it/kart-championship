import type { Ratings } from '@/lib/ratings'
import { TeamLogo } from '@/components/team-logo'

const TEAM_COLORS: Record<string, string> = {
  ferrari: '#e10600',
  'nxt / buzi': '#ac1db8',
  buzi: '#ac1db8',
  nxt: '#ac1db8',
  mercedes: '#14b8a6',
  'red bull': '#3b5bff',
  porsche: '#9ca3af',
  renault: '#facc15',
  mclaren: '#ff8000',
}

function GreekFlag() {
  return (
    <svg viewBox="0 0 27 18" className="h-4 w-6 rounded-[2px]" aria-label="Greece" role="img">
      <rect width="27" height="18" fill="#0d5eaf" />
      {[1, 3, 5, 7].map((i) => (
        <rect key={i} y={i * 2} width="27" height="2" fill="#fff" />
      ))}
      <rect width="10" height="10" fill="#0d5eaf" />
      <rect x="4" width="2" height="10" fill="#fff" />
      <rect y="4" width="10" height="2" fill="#fff" />
    </svg>
  )
}

export function DriverCard({
  name,
  team,
  photoUrl,
  position,
  ratings,
}: {
  name: string
  team: string
  photoUrl: string | null
  position: number
  ratings: Ratings
}) {
  const color = TEAM_COLORS[team.toLowerCase()] ?? '#e10600'
  const stats = [
    { label: 'EXP', value: ratings.exp },
    { label: 'RAC', value: ratings.rac },
    { label: 'CON', value: ratings.con },
    { label: 'PAC', value: ratings.pac },
  ]
  const mask = 'linear-gradient(to bottom, #000 55%, transparent 100%)'

  return (
    <div className="flex w-full max-w-[340px] flex-col gap-2">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Driver card · Season 2026</p>
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border"
        style={{
          borderColor: `${color}99`,
          background: `linear-gradient(165deg, color-mix(in srgb, ${color} 55%, #000) 0%, #0b0b0c 78%)`,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="absolute inset-x-0 top-0 h-[66%] w-full object-cover object-top"
            style={{ maskImage: mask, WebkitMaskImage: mask }}
          />
        ) : (
          <span aria-hidden className="absolute inset-x-0 top-8 text-center text-[9rem] font-black italic leading-none opacity-25">
            {name.charAt(0)}
          </span>
        )}

        <div className="absolute left-5 top-4 z-10 flex flex-col leading-none" style={{ textShadow: '0 2px 12px rgba(0,0,0,.6)' }}>
          <span className="font-mono text-[11px] font-bold tracking-[0.3em]" style={{ color }}>RTG</span>
          <span className="text-6xl font-black tabular-nums sm:text-7xl">{ratings.rtg ?? '–'}</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <GreekFlag />
            <span>P{position}</span>
          </div>
          <h1 className="break-words text-3xl font-black uppercase italic leading-none tracking-tight sm:break-normal sm:text-4xl">{name}</h1>
          <div className="flex items-center gap-2"><TeamLogo team={team} size="md"/><p className="font-mono text-sm font-bold uppercase tracking-widest" style={{ color }}>{team}</p></div>
          <dl
            className="mt-1 grid grid-cols-4 divide-x divide-white/20 rounded-xl py-2"
            style={{ background: `color-mix(in srgb, ${color} 70%, #000)` }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <dt className="font-mono text-[10px] font-bold tracking-widest text-white/80">{stat.label}</dt>
                <dd className="text-xl font-black tabular-nums text-white sm:text-2xl">{stat.value ?? '–'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
