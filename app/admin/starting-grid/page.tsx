import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getChampionship } from '@/lib/championship'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StartingGridGenerator } from '@/components/grid-generator'
import { StartingGridCards } from '@/components/starting-grid-cards'
import { clearStartingGrid } from './actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin Starting Grid | Kart Championship', robots: { index: false, follow: false } }

export default async function AdminStartingGridPage() {
  if (!isSupabaseConfigured) redirect('/auth/login')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin')
  if (roleError || !isAdmin) redirect('/admin')

  const [championship, published] = await Promise.all([getChampionship(), supabase.from('published_starting_grid').select('driver_ids,updated_at').eq('id',true).maybeSingle()])
  return <>
    <SiteHeader />
    <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:py-16 md:px-6">
      <Link href="/admin" className="mb-6 inline-block min-h-11 py-3 text-sm font-bold uppercase text-primary">← Back to Admin</Link>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Race Control · Admin Only</p>
      <h1 className="mb-3 mt-2 text-3xl font-black uppercase italic tracking-tight sm:text-5xl">Starting Grid Generator</h1>
      <p className="mb-8 text-sm text-muted-foreground">Only Admin can generate and publish the grid. Visitors can view the published order, but cannot change it.</p>
      {published.error ? <p role="alert" className="mb-4 rounded-sm border border-destructive/50 p-4 text-sm">Starting Grid storage is not ready. Run scripts/007_starting_grid.sql in Supabase.</p> : null}
      <div className="mb-6 rounded-sm border border-border bg-card p-4">
        <h2 className="font-bold uppercase">Current published grid</h2>
        {published.data && Array.isArray(published.data.driver_ids) ? <>
          <div className="mt-4"><StartingGridCards driverIds={published.data.driver_ids as string[]} drivers={championship.drivers} /></div>
          <form action={clearStartingGrid}><button className="mt-4 min-h-11 rounded-sm border border-border px-4 font-bold uppercase" type="submit">Unpublish grid</button></form>
        </> : <p className="mt-2 text-sm text-muted-foreground">No grid published yet.</p>}
      </div>
      <StartingGridGenerator drivers={championship.drivers} races={championship.races} results={championship.results} adminMode />
    </main>
    <SiteFooter />
  </>
}
