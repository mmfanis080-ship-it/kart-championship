import Link from 'next/link'
import { Lock } from 'lucide-react'
import { MobileMenu } from '@/components/mobile-menu'

const mainLinks = [
  { label: 'Standings', href: '/#standings' },
  { label: 'Battle', href: '/#battle' },
  { label: 'Attendance', href: '/#attendance' },
  { label: 'Teams', href: '/#constructors' },
  { label: 'Calendar', href: '/#calendar' },
  { label: 'Results', href: '/#results' },
  { label: 'Awards', href: '/awards' },
]

const moreLinks = [
  { label: 'Lap Comparison', href: '/laps' },
  { label: 'Hall of Fame', href: '/hall-of-fame' },
  { label: 'Head-to-Head', href: '/head-to-head' },
  { label: 'Starting Grid', href: '/starting-grid' },
  { label: 'Championship Tools', href: '/#tools' },
  { label: 'Rules', href: '/rules' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6 xl:gap-5">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-3"
          aria-label="Kart Championship home"
        >
          <span aria-hidden className="flex h-9 items-center gap-1">
            <span className="h-9 w-2 -skew-x-12 bg-primary" />
            <span className="h-9 w-1 -skew-x-12 bg-primary/60" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="max-w-[185px] text-base font-black uppercase italic tracking-tight sm:text-lg xl:max-w-none">
              Kart Championship
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Season 2026
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex 2xl:gap-1">
          {mainLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 whitespace-nowrap rounded-sm px-2.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground 2xl:px-3 2xl:text-xs"
            >
              {label}
            </Link>
          ))}
          <details className="group relative shrink-0">
            <summary className="list-none cursor-pointer whitespace-nowrap rounded-sm px-2.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground 2xl:px-3 2xl:text-xs [&::-webkit-details-marker]:hidden">
              More ▾
            </summary>
            <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-md border border-border bg-background p-2 shadow-xl">
              {moreLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="block whitespace-nowrap rounded-sm px-3 py-2.5 text-xs font-semibold uppercase text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <Link
            href="/driver"
            className="whitespace-nowrap rounded-sm border border-primary/60 px-3 py-2 text-xs font-bold uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Driver Sign In
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 whitespace-nowrap rounded-sm border border-border px-3 py-2 text-xs font-bold uppercase transition-colors hover:border-primary hover:text-primary"
          >
            <Lock className="size-3.5" aria-hidden />
            Admin
          </Link>
        </div>

        <MobileMenu />
      </div>

      <nav aria-label="Quick sections" className="mobile-section-rail flex gap-1 overflow-x-auto border-t border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide sm:hidden">
        {[
          ['Standings', '/#standings'],
          ['Battle', '/#battle'],
          ['Attendance', '/#attendance'],
          ['Teams', '/#constructors'],
          ['Calendar', '/#calendar'],
          ['Results', '/#results'],
          ['Awards', '/awards'],
          ['Laps', '/laps'],
          ['Hall of Fame', '/hall-of-fame'],
          ['Head-to-Head', '/head-to-head'],
          ['Starting Grid', '/starting-grid'],
          ['Rules', '/rules'],
          ['Driver Account', '/driver'],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 whitespace-nowrap rounded-sm px-3 py-2.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
