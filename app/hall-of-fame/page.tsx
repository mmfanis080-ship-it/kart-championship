import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Crown, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Hall of Fame | Kart Championship',
  description: "Kart Championship past champions. Fanis won the 2025 Drivers\' Championship.",
}

/** Historical championship records are separate from the live 2026 standings. */
const champions = [{season: 2025, name: 'FANIS', title: "Drivers' Champion"}] as const

export default function HallOfFamePage() {
  return <>
    <SiteHeader />
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase text-muted-foreground hover:text-primary"><ArrowLeft aria-hidden className="size-4" /> Back to championship</Link>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Championship History</p>
      <h1 className="mb-4 mt-2 text-3xl font-black uppercase italic sm:text-5xl">Hall of Fame</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground sm:text-base">Celebrating the Drivers' Champions from previous seasons.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {champions.map(champion => <article key={champion.season} className="relative overflow-hidden rounded-sm border border-primary/50 bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Season {champion.season}</span><Crown aria-hidden className="size-7 text-primary" /></div>
          <div className="my-8 flex justify-center"><Trophy aria-label="Championship trophy" className="size-20 text-primary sm:size-24" strokeWidth={1.35} /></div>
          <p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">{champion.title}</p>
          <h2 className="mt-2 text-center text-4xl font-black uppercase italic tracking-tight sm:text-5xl">{champion.name}</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">Champion of the {champion.season} Kart Championship</p>
        </article>)}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">2026 champion will be added after the season ends. Historical titles do not affect current standings.</p>
    </main>
    <SiteFooter />
  </>
}
