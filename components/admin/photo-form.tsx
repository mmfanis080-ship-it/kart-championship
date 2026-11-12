'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { labelClass } from '@/components/form-styles'
import type { DriverRow } from '@/lib/championship'
import { uploadDriverPhoto } from '@/app/admin/actions'

// Phone photos are often 4-10 MB. Shrink to max 1200px JPEG (a few hundred KB) before uploading.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('resize failed')
  return new File([blob], 'photo.jpg', { type: 'image/jpeg' })
}

function UploadButton({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={busy || pending} className="h-9 font-bold uppercase">
      {pending ? 'Uploading…' : busy ? 'Preparing…' : 'Upload'}
    </Button>
  )
}

export function PhotoForm({ driver }: { driver: DriverRow }) {
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    setProblem(null)
    if (!file) return
    setBusy(true)
    try {
      const small = await shrink(file)
      const transfer = new DataTransfer()
      transfer.items.add(small)
      input.files = transfer.files
    } catch {
      input.value = ''
      setProblem('This image could not be read. Try a JPG or PNG.')
    } finally {
      setBusy(false)
    }
  }

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
      <label htmlFor={`${driver.id}-photo`} className={labelClass}>Photo</label>
      <input
        id={`${driver.id}-photo`}
        name="photo"
        type="file"
        accept="image/*"
        required
        onChange={onPick}
        className="max-w-full text-sm"
      />
      <UploadButton busy={busy} />
      {problem && <p role="alert" className="w-full text-sm text-destructive">{problem}</p>}
    </form>
  )
}
