import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DriverForm } from '@/components/admin/driver-form'
import { PhotoForm } from '@/components/admin/photo-form'
import { RaceForm } from '@/components/admin/race-form'
import { TrackImageForm } from '@/components/admin/track-image-form'
import { ResultsEditor } from '@/components/admin/results-editor'
import { SectionHeading } from '@/components/section-heading'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { classifyRace, getChampionship } from '@/lib/championship'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import { signOut, syncPointsFromResults } from './actions'

export const metadata: Metadata = {
  title: 'Race Control | Kart Championship',
  robots: { index: false },
}

const errorMessages: Record<string, string> = {
  invalid: 'Please check the values. Numbers must be whole and non-negative.',
  rls: 'Your Supabase Row Level Security policies did not allow this change for your account.',
  'in-use': 'This record is still referenced by race results. Remove those results first.',
  'save-failed': 'The change could not be saved. Please try again.',
  photo: 'The photo must be a JPG, PNG or WebP image up to 3 MB.',
  'photo-upload': 'The photo could not be uploaded. Make sure the photo storage SQL (003) has been run.',
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  if (!isSupabaseConfigured) redirect('/auth/login')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ error, saved }, championship] = await Promise.all([searchParams, getChampionship()])
  const { drivers, races, source, errorMessage } = championship
  const nextRound = (races.at(-1)?.round ?? 0) + 1

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Race Control</p>
            <h1 className="text-4xl font-black uppercase italic tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="font-bold uppercase">Sign out</Button>
          </form>
        </div>

        {source === 'error' && (
          <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm">
            Could not load data from Supabase: {errorMessage}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm">
            {errorMessages[error] ?? errorMessages['save-failed']}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="rounded-sm border border-primary/30 bg-primary/10 p-3 text-sm">
            Changes saved. The public leaderboard is updated.
          </p>
        )}

        <section aria-labelledby="drivers" className="flex scroll-mt-24 flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <SectionHeading id="drivers" eyebrow="Standings" title="Drivers & Teams" />
            <form action={syncPointsFromResults}>
              <Button type="submit" variant="outline" className="font-bold uppercase">
                Recalculate points from results
              </Button>
            </form>
          </div>
          <div className="flex flex-col gap-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex flex-col gap-2">
                <DriverForm driver={driver} />
                <PhotoForm driver={driver} />
              </div>
            ))}
          </div>
          <h3 className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Add a driver</h3>
          <DriverForm />
        </section>

        <section aria-labelledby="calendar" className="flex scroll-mt-24 flex-col gap-4">
          <SectionHeading id="calendar" eyebrow="Schedule" title="Calendar" />
          {races.map((race) => (
            <div key={race.id} className="flex flex-col gap-2">
              <RaceForm race={race} />
              <TrackImageForm race={race} />
            </div>
          ))}
          <h3 className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Add a race</h3>
          <RaceForm nextRound={nextRound} />
        </section>

        <section aria-labelledby="results" className="flex scroll-mt-24 flex-col gap-4">
          <SectionHeading id="results" eyebrow="Classification" title="Race Results" />
          {races.length === 0 && <p className="text-sm text-muted-foreground">Add a race in the Calendar first.</p>}
          {races.map((race) => (
            <ResultsEditor key={race.id} race={race} results={classifyRace(championship, race.id)} drivers={drivers} />
          ))}
        </section>
      </main>
    </>
  )
}
