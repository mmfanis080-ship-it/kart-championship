import { TeamLogo, getTeamBattleColor } from '@/components/team-logo'
import { PosterShareActions } from '@/components/poster-share-actions'

type Winner = {
  name: string
  team: string
  photoUrl: string | null
  votes: number
  finishPosition?: number | null
  clipTitle?: string | null
}

/** This is a responsive visual poster, not an externally generated image. */
export function AwardWinnerPoster({ winner, awardKind, awardTitle, label }: {
  winner: Winner
  awardKind: 'driver_of_the_day' | 'overtake_of_the_month'
  awardTitle: string
  label?: string
}) {
  const c = getTeamBattleColor(winner.team)
  const isDotd = awardKind === 'driver_of_the_day'
  return <article className="mx-auto w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/20 bg-[#101621] text-white shadow-2xl" aria-label={`${winner.name} wins ${awardTitle}`}>
    <div className="relative isolate min-h-[470px] overflow-hidden sm:min-h-[560px]" style={{ background: `linear-gradient(150deg, ${c}50 0%, #101621 42%, #080a12 100%)` }}>
      <div className="absolute inset-y-0 right-0 w-[35%] opacity-25" style={{ background: `repeating-linear-gradient(-45deg, transparent, transparent 16px, ${c} 17px, ${c} 20px)` }} aria-hidden="true"/>
      <div className="absolute left-0 top-0 z-10 w-full border-b-4 bg-white px-5 py-4 text-center text-[#0a1222]" style={{ borderColor: c }}>
        <p className="text-[10px] font-black uppercase tracking-[.28em] text-slate-500">Kart Championship · Award Winner</p>
        <h3 className="mt-1 text-2xl font-black uppercase italic leading-none sm:text-3xl">{isDotd ? 'Driver of the Day' : 'Overtake of the Month'}</h3>
      </div>
      <div className="absolute inset-x-0 bottom-[145px] top-[95px] flex items-end justify-center">
        {winner.photoUrl ? (
          // Photos are supplied by the championship's existing driver records.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={winner.photoUrl} alt={`${winner.name} portrait`} className="h-full w-full object-contain object-bottom" loading="lazy" style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}/>
        ) : <span aria-hidden="true" className="self-center text-[11rem] font-black opacity-20">{winner.name.charAt(0)}</span>}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#090b14] via-[#090b14]/95 to-transparent px-5 pb-5 pt-16 sm:px-7">
        <div className="text-center">
          {label && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/75">{label}</p>}
          <p className="break-words text-4xl font-black uppercase italic leading-[.95] tracking-tight sm:text-5xl" style={{ color: c }}>{winner.name}</p>
          <div className="mt-3 flex items-center justify-center gap-2"><TeamLogo team={winner.team} size="sm"/><span className="font-mono text-xs font-bold uppercase tracking-widest">{winner.team}</span></div>
        </div>
        {winner.clipTitle && <p className="mt-3 break-words text-center text-sm font-bold uppercase text-white/90">{winner.clipTitle}</p>}
        <div className="mt-5 grid grid-cols-2 border-t border-white/20 pt-3 text-center">
          <div className="border-r border-white/20"><p className="font-mono text-[10px] uppercase tracking-wider text-white/65">Final votes</p><p className="mt-1 text-3xl font-black">{winner.votes}</p></div>
          <div><p className="font-mono text-[10px] uppercase tracking-wider text-white/65">{isDotd ? 'Race finish' : 'Award'}</p><p className="mt-1 text-2xl font-black">{isDotd ? (winner.finishPosition != null ? `P${winner.finishPosition}` : '—') : 'WINNER'}</p></div>
        </div>
      </div>
    </div>
    <div className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-slate-300">{awardTitle}</div>
    <PosterShareActions winner={winner} awardKind={awardKind} awardTitle={awardTitle} color={c} />
  </article>
}
