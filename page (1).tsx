import type { Metadata } from 'next'
import { getChampionship } from '@/lib/championship'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { DataNotice } from '@/components/data-notice'
import { H2HSelector } from '@/components/h2h-selector'
import { getH2HDrivers } from '@/lib/h2h'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Driver Head-to-Head | Kart Championship' }
export default async function Page() {
  const championship = await getChampionship()
  return <><SiteHeader /><DataNotice source={championship.source} /><main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:py-16 md:px-6">
  <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Kart Championship Tools</p>
  <h1 className="mb-3 mt-2 text-3xl font-black uppercase italic tracking-tight sm:text-5xl">Driver Head-to-Head</h1>
  <p className="mb-8 text-sm text-muted-foreground">Live championship data · Read-only simulator · Mobile friendly</p>
  <H2HSelector drivers={getH2HDrivers(championship)} />
  </main><SiteFooter /></>
}
