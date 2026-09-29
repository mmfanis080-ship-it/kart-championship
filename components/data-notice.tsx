import { Info } from 'lucide-react'
import type { DataSource } from '@/lib/championship'

export function DataNotice({ source }: { source: DataSource }) {
  if (source === 'live') return null

  const message =
    source === 'demo'
      ? 'Showing demo data. Connect Supabase and run scripts/001_create_championship.sql to go live.'
      : 'Could not load live data from Supabase. Make sure the championship tables exist.'

  return (
    <div role="status" className="border-b border-primary/30 bg-primary/10">
      <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-sm md:px-6">
        <Info className="size-4 shrink-0 text-primary" aria-hidden />
        {message}
      </p>
    </div>
  )
}
