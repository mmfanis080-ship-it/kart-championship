import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DriverForm } from '@/components/admin/driver-form'

import type { AttendanceEntry } from '@/lib/attendance'
import { PhotoForm } from '@/components/admin/photo-form'
import { RaceForm } from '@/components/admin/race-form'
import { TrackImageForm } from '@/components/admin/track-image-form'
import { ResultsEditor } from '@/components/admin/results-editor'
import { SectionHeading } from '@/components/section-heading'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { classifyRace, getChampionship } from '@/lib/championship'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { requireAdminSession } from '@/lib/driver-session'
import { signOut, syncPointsFromResults } from './actions'
import { DriverAccountManager } from '@/components/admin/driver-account-manager'

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
  attendance: 'Check SQL migration 006 and your Admin permissions.',
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  if (!isSupabaseConfigured) redirect('/auth/login')

  const { supabase, user } = await requireAdminSession()

  const [{ error, saved }, championship, entryQuery] = await Promise.all([
    searchParams, getChampionship(),
    supabase.from('attendance_entries').select('race_id, driver_id, choice, updated_at'),
  ])
  const { data: usernameAccounts } = await supabase.from('driver_username_accounts').select('driver_id,username')
  const attendanceEntries = (entryQuery.data ?? []) as AttendanceEntry[]
  const { drivers, races, source, errorMessage, pointsFromResults } = championship
  const nextRound = (races.at(-1)?.round ?? 0) + 1

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Race Control</p>
            <h1 className="break-words text-3xl font-black uppercase italic tracking-tight sm:text-4xl">Admin Dashboard</h1>
            <p className="break-all text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="font-bold uppercase">Sign out</Button>
          </form>
        </div>

        <section id="driver-accounts">
          <DriverAccountManager drivers={drivers.map(d => ({id:d.id,name:d.name,team:d.team}))} accounts={usernameAccounts ?? []} />
        </section>
        <Link href="/admin/awards" className="inline-flex min-h-12 w-fit items-center rounded-sm border border-primary/60 bg-card px-5 py-3 font-bold uppercase text-primary hover:border-primary">Manage Driver of the Day and Overtake Awards →</Link>

        <Link href="/admin/starting-grid" className="inline-flex min-h-12 w-fit items-center rounded-sm border border-primary/60 bg-card px-5 py-3 font-bold uppercase text-primary hover:border-primary">
          Open Starting Grid Generator →
        </Link>

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
          <p className="text-sm text-muted-foreground">
            Μπορείς να αλλάξεις χειροκίνητα τους συνολικούς βαθμούς κάθε οδηγού και να πατήσεις Save.
            Η σειρά της βαθμολογίας ενημερώνεται με τους νέους βαθμούς και σε ισοβαθμία
            μετράνε οι τερματισμοί των Race Results. Αν αλλάξεις αποτελέσματα αγώνων,
            πάτησε «Recalculate points from results» για να ξαναϋπολογιστούν τα σύνολα.
            Προσοχή: ο επανυπολογισμός αντικαθιστά τις χειροκίνητες αλλαγές βαθμών.
          </p>
          <div className="flex flex-col gap-3">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex flex-col gap-2">
                <DriverForm driver={driver} pointsFromResults={pointsFromResults} />
                <PhotoForm driver={driver} />
              </div>
            ))}
          </div>
          <h3 className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">Add a driver</h3>
          <DriverForm pointsFromResults={pointsFromResults} />
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

        <section aria-labelledby="attendance-links" className="flex scroll-mt-24 flex-col gap-4">
          <SectionHeading id="attendance-links" eyebrow="Driver dashboard" title="Race Attendance" />
          <p className="text-sm text-muted-foreground">Οι οδηγοί δηλώνουν παρουσία μέσα από το προσωπικό τους dashboard με username και password. Οι παλιοί προσωπικοί σύνδεσμοι απενεργοποιούνται από το migration 008.</p>
          <div className="rounded-sm border border-border bg-card p-4 sm:hidden">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Responses per upcoming race · Admin only</p>
            <div className="grid gap-3">{races.filter(r=>!r.completed).map(r=>{
              const votes=attendanceEntries.filter(v=>v.race_id===r.id)
              const summaries=[['Yes',votes.filter(v=>v.choice==='yes').length],['Maybe',votes.filter(v=>v.choice==='maybe').length],['No',votes.filter(v=>v.choice==='no').length],['Pending',Math.max(0,drivers.length-votes.length)]] as const
              return <article key={r.id} className="rounded-sm border border-border p-3">
                <p className="break-words text-sm font-bold uppercase">R{r.round}: {r.name}</p>
                <dl className="mt-3 grid grid-cols-4 gap-1 text-center">{summaries.map(([label,value])=><div key={label}>
                  <dt className="text-[10px] text-muted-foreground">{label}</dt><dd className="font-mono text-lg font-bold">{value}</dd>
                </div>)}</dl>
              </article>
            })}</div>
          </div>
          <div className="hidden overflow-x-auto rounded-sm border border-border bg-card p-4 sm:block">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Responses per upcoming race · Admin only</p>
            <table className="w-full min-w-[420px] text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2">Race</th><th>Yes</th><th>Maybe</th><th>No</th><th>Pending</th></tr></thead><tbody>{races.filter(r => !r.completed).map(r => { const votes=attendanceEntries.filter(v=>v.race_id===r.id); return <tr className="border-b border-border/40" key={r.id}><td className="py-2">R{r.round}: {r.name}</td><td>{votes.filter(v=>v.choice==='yes').length}</td><td>{votes.filter(v=>v.choice==='maybe').length}</td><td>{votes.filter(v=>v.choice==='no').length}</td><td>{Math.max(0, drivers.length-votes.length)}</td></tr> })}</tbody></table>
          </div>
          <div className="rounded-sm border border-border bg-card p-4 sm:hidden">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Each driver's upcoming race response</p>
            <div className="grid gap-2">{drivers.map(driver=><details key={driver.id} className="rounded-sm border border-border p-3">
              <summary className="cursor-pointer text-sm font-bold uppercase">{driver.name}</summary>
              <dl className="mt-3 grid grid-cols-2 gap-2">{races.filter(r=>!r.completed).map(r=>{
                const vote=attendanceEntries.find(v=>v.race_id===r.id&&v.driver_id===driver.id)
                return <div key={r.id} className="rounded-sm bg-background/50 p-2"><dt className="text-[11px] text-muted-foreground">R{r.round}: {r.name}</dt><dd className="mt-1 font-mono text-xs font-bold uppercase">{vote?.choice??'Pending'}</dd></div>
              })}</dl>
            </details>)}</div>
          </div>
          <div className="hidden overflow-x-auto rounded-sm border border-border bg-card p-4 sm:block">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Each driver's upcoming race response</p>
            <table className="w-full min-w-[460px] text-sm"><thead><tr className="border-b border-border text-left"><th className="py-2 pr-4">Driver</th>{races.filter(r=>!r.completed).map(r=><th key={r.id} className="px-3 py-2 text-center">R{r.round}</th>)}</tr></thead><tbody>{drivers.map(driver=><tr key={driver.id} className="border-b border-border/40"><th className="py-2 pr-4 text-left font-semibold">{driver.name}</th>{races.filter(r=>!r.completed).map(r=>{const vote=attendanceEntries.find(v=>v.race_id===r.id&&v.driver_id===driver.id);return <td key={r.id} className="px-3 py-2 text-center font-mono text-xs uppercase">{vote?.choice??'–'}</td>})}</tr>)}</tbody></table>
          </div>
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
