import Image from 'next/image'

type TeamBrand = {
  asset: string
  color: string
  battleColor?: string
  bg: string
  imageClassName?: string
}

const TEAM_BRANDS: Record<string, TeamBrand> = {
  mclaren: { asset: 'mclaren', color: '#ff8000', bg: '#17191f', imageClassName: 'p-0.5' },
  ferrari: { asset: 'ferrari', color: '#e10600', bg: '#17191f', imageClassName: 'p-0.5' },
  mercedes: { asset: 'mercedes', color: '#00d2be', bg: '#17191f', imageClassName: 'p-1' },
  porsche: { asset: 'porsche', color: '#d3b15d', bg: '#17191f', imageClassName: 'p-0.5' },
  'red bull': { asset: 'red-bull', color: '#1e40ff', battleColor: '#3b82f6', bg: '#17191f', imageClassName: 'p-0.5' },
  renault: { asset: 'renault', color: '#ffd500', battleColor: '#ffd500', bg: '#ffd500', imageClassName: 'p-1' },
  'nxt / buzi': { asset: 'nxt-buzi', color: '#ac1db8', battleColor: '#ac1db8', bg: '#ffffff', imageClassName: 'p-0' },
}

const TEAM_ALIASES: Record<string, keyof typeof TEAM_BRANDS> = {
  'red bull racing': 'red bull',
  rbpt: 'red bull',
  'red bull honda rbpt': 'red bull',
  'nxt/buzi': 'nxt / buzi',
  buzi: 'nxt / buzi',
  nxt: 'nxt / buzi',
}

function normalizeTeam(team: string) {
  return team.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getTeamBrand(team: string): TeamBrand | undefined {
  const normalized = normalizeTeam(team)
  const resolved = TEAM_ALIASES[normalized] ?? normalized
  return TEAM_BRANDS[resolved]
}

export function getTeamColor(team: string) {
  return getTeamBrand(team)?.color ?? '#737373'
}

export function getTeamBattleColor(team: string) {
  const brand = getTeamBrand(team)
  return brand?.battleColor ?? brand?.color ?? '#d1d5db'
}

export function TeamLogo({ team, size = 'sm', className = '' }: { team: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const brand = getTeamBrand(team)
  const sizes = { sm: 'size-7', md: 'size-11', lg: 'size-16' }

  return (
    <span
      title={team}
      aria-label={`${team} team`}
      className={`inline-flex ${sizes[size]} shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 ${className}`}
      style={{ borderColor: brand?.color ?? '#737373', backgroundColor: brand?.bg ?? '#17191f' }}
    >
      {brand ? (
        <Image
          src={`/team-logos/${brand.asset}.png`}
          alt={`${team} logo`}
          width={64}
          height={64}
          unoptimized
          className={`h-full w-full object-contain ${brand.imageClassName ?? 'p-0.5'}`}
        />
      ) : (
        <span className="px-1 text-center text-[9px] font-black uppercase leading-tight text-white">{team.trim().split(/\s+/).map(w => w[0]).slice(0, 3).join('')}</span>
      )}
    </span>
  )
}
