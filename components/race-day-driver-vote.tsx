'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { submitAwardVote } from '@/app/driver/actions'
import { TeamLogo, getTeamBattleColor } from '@/components/team-logo'

type Candidate = {
  id: string
  name: string
  team: string
  photoUrl: string | null
  title: string | null
}

export function RaceDayDriverVote({
  awardId,
  title,
  candidates,
  signedIn,
  chosen,
  raceName,
}: {
  awardId: string
  title: string
  candidates: Candidate[]
  signedIn: boolean
  chosen: string | null
  raceName: string
}) {
  const [state, vote, pending] = useActionState(submitAwardVote, { ok: false, message: '' })

  return (
    <section aria-labelledby="dotd-title" className="relative overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-br from-[#0795c9] via-[#075e99] to-[#102451] px-4 py-6 text-white shadow-2xl sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[.2em] text-white/75">Race day · {raceName}</p>
          <h2 id="dotd-title" className="text-3xl font-black uppercase italic tracking-tight sm:text-5xl">Driver of the Day</h2>
          <p className="mt-2 text-sm font-semibold text-white/80">{title} · Choose your standout driver</p>
        </div>
        <span className="rounded-full border border-white/40 px-3 py-1 font-mono text-xs uppercase tracking-widest">Voting live</span>
      </div>

      <form action={vote}>
        <input type="hidden" name="award_id" value={awardId} />
        <div className="grid gap-3 sm:grid-cols-2">
          {candidates.map((candidate) => {
            const selected = candidate.id === chosen
            return (
              <article key={candidate.id} className="relative flex min-h-[124px] items-center overflow-hidden rounded-xl border border-white/20 bg-white text-[#101b30] shadow-sm sm:min-h-[142px]">
                <div className="relative h-[124px] w-[96px] shrink-0 self-end overflow-hidden bg-[#ebedf1] sm:h-[142px] sm:w-[115px]">
                  {candidate.photoUrl ? (
                    // Driver photographs are provided by the existing championship database.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                  ) : (
                    <span aria-hidden className="flex h-full w-full items-center justify-center text-5xl font-black text-slate-400">{candidate.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 px-3 py-3 sm:px-4">
                  <p className="break-words text-lg font-black uppercase leading-tight sm:text-xl">{candidate.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <TeamLogo team={candidate.team} size="sm" />
                    <span className="min-w-0 truncate text-xs font-semibold sm:text-sm" style={{ color: getTeamBattleColor(candidate.team) === '#f5f5f5' ? '#891893' : getTeamBattleColor(candidate.team) }}>{candidate.team}</span>
                  </div>
                  {candidate.title && <p className="mt-2 break-words text-xs text-slate-600">{candidate.title}</p>}
                </div>
                <div className="shrink-0 pr-3 sm:pr-4">
                  {signedIn ? (
                    <button type="submit" name="nominee_id" value={candidate.id} disabled={pending} aria-label={`Vote for ${candidate.name}`} className={`min-h-11 rounded-full border px-3 text-xs font-black transition sm:px-5 ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-950 hover:border-blue-600 hover:bg-blue-600 hover:text-white'} disabled:cursor-wait disabled:opacity-60`}>
                      {selected ? 'Voted ✓' : pending ? 'Saving…' : 'Vote'}
                    </button>
                  ) : (
                    <Link href="/driver/login" className="inline-flex min-h-11 items-center rounded-full border border-slate-300 px-3 text-xs font-black text-slate-950 hover:border-blue-600 sm:px-5">Sign in</Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        {signedIn && <p className="mt-4 text-sm text-white/90" role="status" aria-live="polite">{state.message || (chosen ? 'Your vote is recorded. You can change it while voting is open.' : 'One vote per driver. You can change your choice while voting is open.')}</p>}
        {!signedIn && <p className="mt-4 text-sm text-white/90">Sign in with your driver account to cast your vote.</p>}
      </form>
    </section>
  )
}
