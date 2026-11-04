import { Button } from '@/components/ui/button'
import { fieldClass, labelClass } from '@/components/form-styles'
import type { DriverRow } from '@/lib/championship'
import { createDriver, deleteDriver, updateDriver } from '@/app/admin/actions'

export function DriverForm({ driver }: { driver?: DriverRow }) {
  const prefix = driver?.id ?? 'new'

  return (
    <form
      action={driver ? updateDriver : createDriver}
      className="grid grid-cols-2 items-end gap-3 rounded-sm border border-border bg-card p-4 md:grid-cols-[1fr_1fr_6rem_auto]"
    >
      {driver && <input type="hidden" name="id" value={driver.id} />}
      <Field id={`${prefix}-name`} label="Driver" name="name" defaultValue={driver?.name} maxLength={80} />
      <Field id={`${prefix}-team`} label="Team" name="team" defaultValue={driver?.team} maxLength={80} />
      <Field
        id={`${prefix}-points`}
        label="Points"
        name="points"
        type="number"
        min={0}
        max={9999}
        defaultValue={driver?.points ?? 0}
      />
      <div className="flex gap-2">
        <Button type="submit" className="h-10 flex-1 font-bold uppercase">
          {driver ? 'Save' : 'Add driver'}
        </Button>
        {driver && (
          <Button
            type="submit"
            formAction={deleteDriver}
            formNoValidate
            variant="outline"
            className="h-10 font-bold uppercase hover:border-destructive hover:text-destructive"
            aria-label={`Delete ${driver.name}`}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; name: string }

export function Field({ id, label, required = true, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input id={id} required={required} className={fieldClass} {...props} />
    </div>
  )
}
