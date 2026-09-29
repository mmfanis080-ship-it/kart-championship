import { Button } from '@/components/ui/button'
import { labelClass } from '@/components/form-styles'
import type { DriverRow } from '@/lib/championship'
import { uploadDriverPhoto } from '@/app/admin/actions'

export function PhotoForm({ driver }: { driver: DriverRow }) {
  return (
    <form action={uploadDriverPhoto} className="-mt-2 flex flex-wrap items-center gap-3 px-4 pb-2">
      <input type="hidden" name="id" value={driver.id} />
      {driver.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={driver.photo_url} alt="" className="size-10 rounded-sm object-cover" />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-sm border border-dashed border-border text-xs text-muted-foreground">
          –
        </span>
      )}
      <label htmlFor={`${driver.id}-photo`} className={labelClass}>Photo (JPG, PNG or WebP, up to 3 MB)</label>
      <input id={`${driver.id}-photo`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
      <Button type="submit" variant="outline" className="h-9 font-bold uppercase">Upload</Button>
    </form>
  )
}
