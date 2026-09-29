import { Button } from '@/components/ui/button'
import { Field } from '@/components/admin/driver-form'
import { fieldClass, labelClass } from '@/components/form-styles'
import type { ClassifiedResult, Driver, Race } from '@/lib/championship'
import { addResult, deleteResult, saveResult, updateRace } from '@/app/admin/actions'

type ResultsEditorProps = {
  race: Race
  results: ClassifiedResult[]
  drivers: Driver[]
}

export function ResultsEditor({ race, results, drivers }: ResultsEditorProps) {
  const classified = new Set(results.map((result) => result.driver_id))
  const unclassified = drivers.filter((driver) => !classified.has(driver.id))

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4">
      <h3 className="text-lg font-black uppercase italic tracking-tight">Round {race.round}</h3>
      <form action={updateRace} className="grid grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_10rem_auto]">
        <input type="hidden" name="id" value={race.id} />
        <Field id={`${race.id}-name`} label="Race" name="name" defaultValue={race.name} maxLength={80} />
        <Field id={`${race.id}-track`} label="Track" name="track" defaultValue={race.track ?? ''} maxLength={80} required={false} />
        <Field id={`${race.id}-date`} label="Date" name="race_date" type="date" defaultValue={race.race_date ?? ''} required={false} />
        <Button type="submit" variant="outline" className="col-span-2 h-10 font-bold uppercase md:col-span-1">Save race</Button>
      </form>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground">No results entered for this round yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {results.map((result) => (
            <li key={result.id}>
              <form action={saveResult} className="grid grid-cols-2 items-end gap-3 py-3 md:grid-cols-[1fr_6rem_6rem_auto]">
                <input type="hidden" name="id" value={result.id} />
                <div className="col-span-2 flex flex-col md:col-span-1">
                  <span className="font-bold uppercase">{result.driverName}</span>
                  <span className="text-xs text-muted-foreground">{result.team}</span>
                </div>
                <Field id={`${result.id}-pos`} label="Pos" name="position" type="number" min={1} max={99} defaultValue={result.position} />
                <Field id={`${result.id}-pts`} label="Pts" name="points" type="number" min={0} max={999} defaultValue={result.points} />
                <div className="col-span-2 flex gap-2 md:col-span-1">
                  <Button type="submit" className="h-10 flex-1 font-bold uppercase">Save</Button>
                  <Button
                    type="submit"
                    formAction={deleteResult}
                    formNoValidate
                    variant="outline"
                    className="h-10 font-bold uppercase hover:border-destructive hover:text-destructive"
                    aria-label={`Remove ${result.driverName} from round ${race.round}`}
                  >
                    Remove
                  </Button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}

      {unclassified.length > 0 && (
        <form
          action={addResult}
          className="grid grid-cols-2 items-end gap-3 border-t border-border pt-4 md:grid-cols-[1fr_6rem_6rem_auto]"
        >
          <input type="hidden" name="race_id" value={race.id} />
          <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
            <label htmlFor={`${race.id}-driver`} className={labelClass}>Add driver result</label>
            <select id={`${race.id}-driver`} name="driver_id" required className={fieldClass} defaultValue="">
              <option value="" disabled>Select driver</option>
              {unclassified.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <Field id={`${race.id}-new-pos`} label="Pos" name="position" type="number" min={1} max={99} />
          <Field id={`${race.id}-new-pts`} label="Pts" name="points" type="number" min={0} max={999} />
          <Button type="submit" variant="outline" className="col-span-2 h-10 font-bold uppercase md:col-span-1">
            Add result
          </Button>
        </form>
      )}
    </div>
  )
}
