import Image from 'next/image'

/** Local team marks: use the same brand badge across the whole championship UI. */
const TEAM_BADGES: Record<string, { asset: string; color: string }> = {
  mclaren: { asset: 'mclaren', color: '#ff8000' },
  ferrari: { asset: 'ferrari', color: '#e10600' },
  mercedes: { asset: 'mercedes', color: '#00d2be' },
  porsche: { asset: 'porsche', color: '#d3b15d' },
  'red bull': { asset: 'red-bull', color: '#dc2036' },
  'red bull racing': { asset: 'red-bull', color: '#dc2036' },
  renault: { asset: 'renault', color: '#ffd500' },
  'nxt / buzi': { asset: 'nxt-buzi', color: '#cc5cff' },
}
export function TeamLogo({ team, size = 'sm', className = '' }: { team: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const badge = TEAM_BADGES[team.trim().toLowerCase()]
  const sizes = { sm: 'size-7', md: 'size-11', lg: 'size-16' }
  return <span title={team} aria-label={`${team} team`} className={`inline-flex ${sizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-[#17191f] ${className}`} style={{ borderColor: badge?.color ?? '#737373' }}>
    {badge ? <Image src={`/team-logos/${badge.asset}.svg`} alt={`${team} logo`} width={64} height={64} unoptimized className="h-full w-full object-contain p-0.5" /> : <span className="px-1 text-center text-[9px] font-black uppercase leading-tight text-white">{team.trim().split(/\s+/).map(w=>w[0]).slice(0,3).join('')}</span>}
  </span>
}
