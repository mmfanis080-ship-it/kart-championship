import Link from 'next/link'
import { Lock } from 'lucide-react'
import { MobileMenu } from '@/components/mobile-menu'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-6 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Kart Championship home">
          <span aria-hidden className="flex h-8 items-center">
            <span className="h-8 w-2 -skew-x-12 bg-primary" />
            <span className="ml-1 h-8 w-1 -skew-x-12 bg-primary/60" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-[15px] font-black uppercase italic tracking-tight min-[380px]:text-lg">Kart Championship</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Season 2026
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
          <Link href="/#standings" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Standings
          </Link>
          <Link href="/#battle" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground lg:block">Battle</Link>
          <Link href="/#attendance" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground lg:block">Attendance</Link>
          <Link href="/#constructors" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Teams
          </Link>
          <Link href="/#calendar" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Calendar
          </Link>
          <Link href="/#results" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Results
          </Link>
          <Link href="/laps" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Laps
          </Link>
          <Link href="/rules" className="hidden rounded-sm px-3 py-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            Rules
          </Link>
          <Link
            href="/admin"
            className="ml-2 hidden items-center gap-2 rounded-sm border border-border px-3 py-2 transition-colors hover:border-primary hover:text-primary sm:flex"
          >
            <Lock className="size-3.5" aria-hidden />
            Admin
          </Link>
        </nav>
        <MobileMenu />
      </div>
      <nav aria-label="Sections" className="mobile-section-rail flex gap-1 overflow-x-auto border-t border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:hidden">
        {[
          ['Standings', '/#standings'],
          ['Battle', '/#battle'],
          ['Attendance', '/#attendance'],
          ['Teams', '/#constructors'],
          ['Calendar', '/#calendar'],
          ['Results', '/#results'],
          ['Laps', '/laps'],
          ['Rules', '/rules'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="shrink-0 rounded-sm px-3 py-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
