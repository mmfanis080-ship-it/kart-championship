import type { Metadata } from 'next'
import { LapComparison } from '@/components/lap-comparison'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getLapSessions } from '@/lib/laps'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Laps | Kart Championship',
  description: 'Lap time comparison between drivers.',
}

export default async function LapsPage() {
  const sessions = await getLapSessions()
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:px-6 md:py-16">
        <header className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Lap comparison</p>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tight md:text-6xl">Lap Times</h1>
          <p className="max-w-2xl text-muted-foreground">
            Διάλεξε δύο οδηγούς και δες ποιος ήταν πιο γρήγορος, σε ποιο sector και πόσο σταθερός στον κάθε γύρο.
          </p>
        </header>
        {sessions.length === 0 ? (
          <p className="rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
            Δεν υπάρχουν ακόμα χρόνοι γύρων.
          </p>
        ) : (
          <LapComparison sessions={sessions} />
        )}
      </main>
      <SiteFooter />
    </>
  )
}
