import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <p className="font-bold uppercase italic tracking-tight text-foreground">Kart Championship 2026</p>
        <div className="flex flex-wrap items-center gap-3"><Link className="font-mono text-xs uppercase hover:text-primary" href="/hall-of-fame">Hall of Fame</Link><Link className="font-mono text-xs uppercase hover:text-primary" href="/head-to-head">H2H</Link><Link className="font-mono text-xs uppercase hover:text-primary" href="/starting-grid">Grid</Link></div>
      </div>
    </footer>
  )
}
