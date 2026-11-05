'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock, Menu, X } from 'lucide-react'

const links = [
  { label: 'Standings', href: '/#standings' },
  { label: 'Championship Battle', href: '/#battle' },
  { label: 'Attendance', href: '/#attendance' },
  { label: 'Teams', href: '/#constructors' },
  { label: 'Calendar', href: '/#calendar' },
  { label: 'Race Results', href: '/#results' },
  { label: 'Lap Comparison', href: '/laps' },
  { label: 'Hall of Fame', href: '/hall-of-fame' },
  { label: 'Head-to-Head', href: '/head-to-head' },
  { label: 'Starting Grid', href: '/starting-grid' },
  { label: 'Rules', href: '/rules' },
  { label: 'Awards', href: '/awards' },
  { label: 'Driver Account', href: '/driver' },
]

/** Only visible on narrow screens; the desktop navigation remains unchanged. */
export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0 sm:hidden" onKeyDown={(event) => {
      if (event.key === 'Escape') setOpen(false)
    }}>
      <button
        type="button"
        aria-label={open ? 'Close all sections menu' : 'Open all sections menu'}
        aria-expanded={open}
        aria-controls="mobile-all-sections"
        onClick={() => setOpen(value => !value)}
        className="flex size-11 items-center justify-center rounded-sm border border-border text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && (
        <nav
          id="mobile-all-sections"
          aria-label="All site sections"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(90vw,340px)] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-sm border border-border bg-background p-3 shadow-2xl"
        >
          <p className="px-2 pb-3 font-mono text-xs font-bold uppercase tracking-widest text-primary">All sections</p>
          <div className="grid grid-cols-2 gap-2">
            {links.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-sm border border-border bg-card p-3 text-xs font-bold uppercase leading-snug focus-visible:outline-2 focus-visible:outline-primary"
              >{item.label}</Link>
            ))}
          </div>
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-sm border border-primary/50 px-3 text-sm font-bold uppercase text-primary"
          ><Lock className="size-4" aria-hidden /> Admin</Link>
        </nav>
      )}
    </div>
  )
}
