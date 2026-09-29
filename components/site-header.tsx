import Link from 'next/link'
import { Lock } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Kart Championship home">
          <span aria-hidden className="flex h-8 items-center">
            <span className="h-8 w-2 -skew-x-12 bg-primary" />
            <span className="ml-1 h-8 w-1 -skew-x-12 bg-primary/60" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-black uppercase italic tracking-tight">Kart Championship</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Season 2026
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
          <Link href="/#standings" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Standings
          </Link>
          <Link href="/#constructors" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Teams
          </Link>
          <Link href="/#calendar" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Calendar
          </Link>
          <Link href="/#results" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Results
          </Link>
          <Link
            href="/admin"
            className="ml-2 flex items-center gap-2 rounded-sm border border-border px-3 py-2 transition-colors hover:border-primary hover:text-primary"
          >
            <Lock className="size-3.5" aria-hidden />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
