import Link from 'next/link'
import { ArrowUpRight, Crown, GitCompareArrows } from 'lucide-react'

/** Prominent, publicly visible links to features; no Supabase writes. */
export function ChampionshipHighlights() {
  const tools = [
    { href: '/head-to-head', label: 'Head-to-Head', description: 'Compare drivers', Icon: GitCompareArrows },
  ]
  return (
    <section aria-label="Championship highlights" className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10 md:px-6">
      <Link href="/hall-of-fame" className="group flex flex-col gap-3 rounded-sm border border-primary/50 bg-card p-4 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <Crown aria-hidden className="size-8 shrink-0 text-primary" />
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary">Hall of Fame · 2025 Champions</p>
            <h2 className="text-2xl font-black uppercase italic tracking-tight sm:text-3xl">FANIS</h2>
            <p className="text-sm text-muted-foreground">2025 Drivers' Champion · McLaren 2025 Teams' Champion</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-primary">View Hall of Fame <ArrowUpRight aria-hidden className="size-4" /></span>
      </Link>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-1">
        {tools.map(({href,label,description,Icon}) => <Link key={href} href={href} className="flex min-h-20 items-center gap-3 rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
          <Icon aria-hidden className="size-6 shrink-0 text-primary" />
          <span className="min-w-0 flex-1"><span className="block font-black uppercase italic">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span>
          <ArrowUpRight aria-hidden className="size-4 shrink-0 text-primary" />
        </Link>)}
      </div>
    </section>
  )
}
