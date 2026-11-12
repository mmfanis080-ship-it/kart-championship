import { Button } from '@/components/ui/button'
import { Field } from '@/components/admin/driver-form'
import type { Race } from '@/lib/championship'
import { createRace, deleteRace, updateRace } from '@/app/admin/actions'

export function RaceForm({ race, nextRound }: { race?: Race; nextRound?: number }) {
  const prefix = race?.id ?? 'new'
  return (
    <form
      action={race ? updateRace : createRace}
      className="grid grid-cols-2 items-end gap-3 rounded-sm border border-border bg-card p-4 md:grid-cols-[5rem_1fr_1fr_10rem_8rem]"
    >
      {race && <input type="hidden" name="id" value={race.id} />}
      {race ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Round</span>
          <span className="flex h-10 items-center font-mono text-lg font-bold">{race.round}</span>
        </div>
      ) : (
        <Field id="new-round" label="Round" name="round" type="number" min={1} max={99} defaultValue={nextRound} />
      )}
      <Field id={`${prefix}-name`} label="Race" name="name" defaultValue={race?.name} maxLength={80} />
      <Field id={`${prefix}-track`} label="Track" name="track" defaultValue={race?.track ?? ''} maxLength={80} required={false} />
      <Field id={`${prefix}-date`} label="Date" name="race_date" type="date" defaultValue={race?.race_date ?? ''} required={false} />
      <Field id={`${prefix}-time`} label="Time (Athens)" name="race_time" type="time" defaultValue={race?.race_time?.slice(0, 5) ?? ''} required={false} />
      <div className="col-span-2 md:col-span-4">
        <Field id={`${prefix}-details`} label="Details (e.g. Qualifying 10 min · Race 15 laps)" name="details" defaultValue={race?.details ?? ''} maxLength={120} required={false} />
      </div>
      <div className="col-span-2 flex gap-2 md:col-span-1">
        <Button type="submit" className="h-10 flex-1 font-bold uppercase">{race ? 'Save' : 'Add race'}</Button>
        {race && (
          <Button
            type="submit"
            formAction={deleteRace}
            formNoValidate
            variant="outline"
            className="h-10 font-bold uppercase hover:border-destructive hover:text-destructive"
            aria-label={`Delete round ${race.round}`}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
