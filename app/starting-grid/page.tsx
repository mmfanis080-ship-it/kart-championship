import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getChampionship } from '@/lib/championship'
import { StartingGridCards } from '@/components/starting-grid-cards'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Starting Grid | Kart Championship' }

export default async function PublicStartingGrid() {
  const championship = await getChampionship()
  const record = isSupabaseConfigured ? await (await createClient()).from('published_starting_grid').select('driver_ids,updated_at').eq('id',true).maybeSingle() : null
  const ids = record?.data?.driver_ids
  const grid: string[] = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  return <>
    <SiteHeader />
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <Link href="/" className="mb-7 inline-block py-3 text-sm font-bold uppercase text-primary">← Back to championship</Link>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Official Starting Order</p>
      <h1 className="mb-6 mt-2 text-3xl font-black uppercase italic sm:text-5xl">Starting Grid</h1>
      <p className="mb-6 text-sm text-muted-foreground">Read-only. Only the Admin can create or change the official starting grid.</p>
      {grid.length > 0 ? <StartingGridCards driverIds={grid} drivers={championship.drivers} /> : <p className="rounded-sm border border-border bg-card p-6 text-muted-foreground">No official starting grid has been published yet.</p>}
    </main>
    <SiteFooter />
  </>
}
