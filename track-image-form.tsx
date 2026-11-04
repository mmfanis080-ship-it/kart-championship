'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { labelClass } from '@/components/form-styles'
import type { Race } from '@/lib/championship'
import { uploadTrackImage } from '@/app/admin/actions'

// Shrink to max 900px; keep PNG (transparency) as PNG, everything else becomes JPEG.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const png = file.type === 'image/png'
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, png ? 'image/png' : 'image/jpeg', 0.85))
  if (!blob) throw new Error('resize failed')
  return new File([blob], png ? 'track.png' : 'track.jpg', { type: png ? 'image/png' : 'image/jpeg' })
}

function UploadButton({ busy }: { busy: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={busy || pending} className="h-9 font-bold uppercase">
      {pending ? 'Uploading…' : busy ? 'Preparing…' : 'Upload'}
    </Button>
  )
}

export function TrackImageForm({ race }: { race: Race }) {
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
      setProblem('This image could not be read. Try a PNG or JPG.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form action={uploadTrackImage} className="-mt-2 flex flex-wrap items-center gap-3 px-4 pb-2">
      <input type="hidden" name="id" value={race.id} />
      {race.track_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={race.track_image_url} alt="" className="size-10 rounded-sm border border-border object-contain" />
      ) : (
        <span className="flex size-10 items-center justify-center rounded-sm border border-dashed border-border text-xs text-muted-foreground">–</span>
      )}
      <label htmlFor={`${race.id}-track-image`} className={labelClass}>Track image</label>
      <input id={`${race.id}-track-image`} name="image" type="file" accept="image/*" required onChange={onPick} className="max-w-full text-sm" />
      <UploadButton busy={busy} />
      {problem && <p role="alert" className="w-full text-sm text-destructive">{problem}</p>}
    </form>
  )
}
