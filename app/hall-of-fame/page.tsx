import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Crown, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = {
  title: 'Hall of Fame | Kart Championship',
  description: '2025 Kart Championship winners: FANIS (Drivers) and McLaren (Teams).',
}

// Historical champions are independent of live Supabase standings and points.
const champions = {
  drivers: [{ season: 2025, name: 'FANIS', title: "Drivers' Champion" }],
  teams: [{ season: 2025, name: 'McLaren', title: "Teams' Champion" }],
} as const

export default async function HallOfFamePage({ searchParams }: {searchParams: Promise<{category?: string}>}) {
  const { category } = await searchParams
  const active: 'drivers'|'teams' = category === 'teams' ? 'teams' : 'drivers'
  return <>
    <SiteHeader />
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold uppercase text-muted-foreground hover:text-primary"><ArrowLeft aria-hidden className="size-4" /> Back to championship</Link>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Championship History</p>
      <h1 className="mb-4 mt-2 text-3xl font-black uppercase italic sm:text-5xl">Hall of Fame</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground sm:text-base">Celebrating the drivers and teams who won previous championships.</p>
      <nav aria-label="Hall of Fame categories" className="mb-8 inline-flex gap-1 rounded-lg border border-border bg-card p-1">
        <Link href="/hall-of-fame?category=drivers" aria-current={active === 'drivers' ? 'page' : undefined} className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-bold ${active === 'drivers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Drivers</Link>
        <Link href="/hall-of-fame?category=teams" aria-current={active === 'teams' ? 'page' : undefined} className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-bold ${active === 'teams' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Teams</Link>
      </nav>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {champions[active].map(champion => <article key={champion.season} className="relative overflow-hidden rounded-sm border border-primary/50 bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3"><span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Season {champion.season}</span><Crown aria-hidden className="size-7 text-primary" /></div>
          <div className="my-8 flex justify-center"><Trophy aria-label="Championship trophy" className="size-20 text-primary sm:size-24" strokeWidth={1.35} /></div>
          <p className="text-center font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">{champion.title}</p>
          <h2 className="mt-2 break-words text-center text-4xl font-black uppercase italic tracking-tight sm:text-5xl">{champion.name}</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">{champion.season} Kart Championship winner</p>
        </article>)}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">2026 champions will be added after the season ends. Historical titles do not affect current standings.</p>
    </main>
    <SiteFooter />
  </>
}
