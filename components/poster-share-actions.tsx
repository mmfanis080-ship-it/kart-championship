'use client'

import { useState } from 'react'

// 1080 × 1350 image: shareable in Instagram Stories, chats and social feeds.
type ShareWinner = {
  name: string
  team: string
  photoUrl: string | null
  votes: number
  finishPosition?: number | null
  clipTitle?: string | null
}

function posterText(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, maxWidth: number, size: number, color: string, bold = true) {
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${bold ? '900' : '600'} italic ${size}px Arial, sans-serif`
  // Shrink long driver or team names rather than cropping them.
  while (ctx.measureText(value).width > maxWidth && size > 24) {
    size -= 2
    ctx.font = `${bold ? '900' : '600'} italic ${size}px Arial, sans-serif`
  }
  ctx.fillText(value, x, y)
}

// Mobile networks or image hosts can stall without firing load/error.
// Never block the whole poster on an external image.
function loadPhoto(src: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    let finished = false
    const timeout = window.setTimeout(() => finish(null), 7000)
    function finish(value: HTMLImageElement | null) {
      if (finished) return
      finished = true
      window.clearTimeout(timeout)
      img.onload = null
      img.onerror = null
      resolve(value)
    }
    img.crossOrigin = 'anonymous'
    img.onload = () => finish(img)
    img.onerror = () => finish(null)
    img.src = src
  })
}

async function generatePoster(winner: ShareWinner, kind: 'driver_of_the_day' | 'overtake_of_the_month', title: string, accent: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Το πρόγραμμα περιήγησης δεν υποστηρίζει την εξαγωγή εικόνας.')
  const w = canvas.width
  const h = canvas.height
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#182538')
  bg.addColorStop(0.55, '#0d1421')
  bg.addColorStop(1, '#080a10')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  // Racing diagonal stripes.
  ctx.save()
  ctx.globalAlpha = 0.14
  ctx.strokeStyle = accent
  ctx.lineWidth = 24
  for (let i = -1000; i < 2000; i += 90) {
    ctx.beginPath()
    ctx.moveTo(i, 260)
    ctx.lineTo(i + 540, h)
    ctx.stroke()
  }
  ctx.restore()
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, w, 18)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 18, w, 215)
  posterText(ctx, 'KART CHAMPIONSHIP', w / 2, 67, 950, 34, '#59616f')
  posterText(ctx, kind === 'driver_of_the_day' ? 'DRIVER OF THE DAY' : 'OVERTAKE OF THE MONTH', w / 2, 150, 1000, 73, '#101621')
  ctx.fillStyle = accent
  ctx.fillRect(0, 224, w, 10)

  const photo = winner.photoUrl ? await loadPhoto(winner.photoUrl) : null
  if (photo && photo.naturalWidth && photo.naturalHeight) {
    const box = { x: 80, y: 255, width: 920, height: 710 }
    const scale = Math.min(box.width / photo.naturalWidth, box.height / photo.naturalHeight)
    const iw = photo.naturalWidth * scale
    const ih = photo.naturalHeight * scale
    ctx.drawImage(photo, box.x + (box.width - iw) / 2, box.y + box.height - ih, iw, ih)
  } else {
    posterText(ctx, winner.name.trim().charAt(0).toUpperCase() || '1', w / 2, 625, 680, 480, '#303b50')
  }
  const fade = ctx.createLinearGradient(0, 755, 0, 1110)
  fade.addColorStop(0, 'rgba(8, 10, 16, 0)')
  fade.addColorStop(0.65, 'rgba(8, 10, 16, 0.96)')
  fade.addColorStop(1, 'rgba(8, 10, 16, 1)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 755, w, 380)

  posterText(ctx, winner.name.toUpperCase(), w / 2, 990, 1000, 118, accent)
  posterText(ctx, winner.team.toUpperCase(), w / 2, 1070, 900, 43, '#ffffff')
  if (winner.clipTitle) posterText(ctx, winner.clipTitle, w / 2, 1122, 980, 32, '#d2dae6', false)
  ctx.strokeStyle = '#64748b'
  ctx.globalAlpha = 0.4
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(90, 1156)
  ctx.lineTo(990, 1156)
  ctx.stroke()
  ctx.globalAlpha = 1
  posterText(ctx, 'FINAL VOTES', 310, 1200, 410, 31, '#b9c2d2')
  posterText(ctx, kind === 'driver_of_the_day' ? 'RACE FINISH' : 'AWARD', 770, 1200, 410, 31, '#b9c2d2')
  posterText(ctx, String(winner.votes), 310, 1270, 410, 78, '#ffffff')
  posterText(ctx, kind === 'driver_of_the_day' ? (winner.finishPosition != null ? `P${winner.finishPosition}` : '—') : 'WINNER', 770, 1270, 410, 68, '#ffffff')
  ctx.fillStyle = accent
  ctx.fillRect(0, 1333, w, 17)
  return await new Promise<Blob>((resolve, reject) => {
    let done = false
    const timeout = window.setTimeout(() => finish(null), 12000)
    function finish(blob: Blob | null) {
      if (done) return
      done = true
      window.clearTimeout(timeout)
      if (blob) resolve(blob)
      else reject(new Error('Η εξαγωγή PNG δεν ολοκληρώθηκε στο κινητό. Δοκίμασε ξανά από Chrome ή Safari.'))
    }
    try {
      canvas.toBlob(finish, 'image/png')
    } catch (error) {
      window.clearTimeout(timeout)
      reject(error)
    }
  })
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30000)
}

export function PosterShareActions({ winner, awardKind, awardTitle, color }: {
  winner: ShareWinner
  awardKind: 'driver_of_the_day' | 'overtake_of_the_month'
  awardTitle: string
  color: string
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function handleShare(share: boolean) {
    if (busy) return
    setBusy(true)
    setMessage('Δημιουργία αφίσας… Η φωτογραφία μπορεί να χρειαστεί λίγα δευτερόλεπτα.')
    try {
      const png = await generatePoster(winner, awardKind, awardTitle, color)
      const filename = `kart-${awardKind}-${winner.name.toLowerCase().replace(/[^a-z0-9\u0370-\u03ff]+/gi, '-')}.png`
      const file = new File([png], filename, { type: 'image/png' })
      if (share && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${winner.name} — ${awardTitle}` })
          setMessage('Η κοινοποίηση ολοκληρώθηκε ή παραδόθηκε στην εφαρμογή.')
          return
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return
          // Some devices advertise file-sharing but fail at runtime.
        }
      }
      saveBlob(png, filename)
      setMessage(share ? 'Η απευθείας κοινοποίηση δεν υποστηρίχθηκε. Έγινε προσπάθεια λήψης PNG: άνοιξε τις Λήψεις και κοινοποίησε την εικόνα από εκεί.' : 'Έγινε προσπάθεια λήψης PNG. Έλεγξε τις Λήψεις του κινητού.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Η δημιουργία εικόνας απέτυχε.')
    } finally {
      setBusy(false)
    }
  }
  return <div className="space-y-2 px-4 pb-4">
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" disabled={busy} onClick={() => void handleShare(true)} className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#101621] disabled:opacity-60">{busy ? 'Δημιουργία...' : '↗ Κοινοποίηση'}</button>
      <button type="button" disabled={busy} onClick={() => void handleShare(false)} className="rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">↓ Λήψη PNG</button>
    </div>
    {message && <p aria-live="polite" className="text-center text-xs text-slate-300">{message}</p>}
  </div>
}
