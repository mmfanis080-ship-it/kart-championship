'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return supabase
}

function text(formData: FormData, key: string, max: number) {
  const value = String(formData.get(key) ?? '').trim()
  return value.length > 0 && value.length <= max ? value : null
}

function count(formData: FormData, key: string, max = 9999) {
  const raw = formData.get(key)
  if (raw === null || raw === '') return null
  const value = Number(raw)
  return Number.isInteger(value) && value >= 0 && value <= max ? value : null
}

type Outcome = { error: { message: string; code?: string } | null; data: unknown[] | null }

function finish({ error, data }: Outcome, section: string) {
  revalidatePath('/')
  revalidatePath('/admin')
  if (error) {
    console.error(`Admin ${section} write failed:`, error.code, error.message)
    const reason = error.code === '42501' ? 'rls' : error.code === '23503' ? 'in-use' : 'save-failed'
    redirect(`/admin?error=${reason}#${section}`)
  }
  // RLS silently filters rows the user may not change, so zero affected rows means the policy blocked it.
  if (!data || data.length === 0) redirect(`/admin?error=rls#${section}`)
  redirect(`/admin?saved=1#${section}`)
}

function parseDriver(formData: FormData) {
  const name = text(formData, 'name', 80)
  const team = text(formData, 'team', 80)
  const points = count(formData, 'points')
  return name && team && points !== null ? { name, team, points } : null
}

export async function createDriver(formData: FormData) {
  const supabase = await requireUser()
  const driver = parseDriver(formData)
  if (!driver) redirect('/admin?error=invalid#drivers')
  finish(await supabase.from('drivers').insert(driver).select('id'), 'drivers')
}

export async function updateDriver(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  const driver = parseDriver(formData)
  if (!id || !driver) redirect('/admin?error=invalid#drivers')
  finish(await supabase.from('drivers').update(driver).eq('id', id).select('id'), 'drivers')
}

export async function deleteDriver(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  if (!id) redirect('/admin?error=invalid#drivers')
  finish(await supabase.from('drivers').delete().eq('id', id).select('id'), 'drivers')
}

function optionalText(formData: FormData, key: string, max: number) {
  const value = String(formData.get(key) ?? '').trim()
  return value.length > 0 && value.length <= max ? value : null
}

function optionalDate(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim()
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function optionalTime(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '').trim()
  return /^\d{2}:\d{2}$/.test(value) ? value : null
}

export async function createRace(formData: FormData) {
  const supabase = await requireUser()
  const round = count(formData, 'round', 99)
  const name = text(formData, 'name', 80)
  if (!round || !name) redirect('/admin?error=invalid#calendar')
  const track = optionalText(formData, 'track', 80)
  const race_date = optionalDate(formData, 'race_date')
  const race_time = optionalTime(formData, 'race_time')
  const details = optionalText(formData, 'details', 120)
  finish(await supabase.from('races').insert({ round, name, track, race_date, race_time, details }).select('id'), 'calendar')
}

export async function updateRace(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  const name = text(formData, 'name', 80)
  if (!id || !name) redirect('/admin?error=invalid#calendar')
  const track = optionalText(formData, 'track', 80)
  const race_date = optionalDate(formData, 'race_date')
  const race_time = optionalTime(formData, 'race_time')
  const details = optionalText(formData, 'details', 120)
  finish(await supabase.from('races').update({ name, track, race_date, race_time, details }).eq('id', id).select('id'), 'calendar')
}

export async function deleteRace(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  if (!id) redirect('/admin?error=invalid#calendar')
  finish(await supabase.from('races').delete().eq('id', id).select('id'), 'calendar')
}

const MAX_PHOTO_BYTES = 3 * 1024 * 1024
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export async function uploadDriverPhoto(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  const file = formData.get('photo')
  if (!id || !(file instanceof File) || file.size === 0) redirect('/admin?error=invalid#drivers')
  if (file.size > MAX_PHOTO_BYTES || !PHOTO_TYPES[file.type]) redirect('/admin?error=photo#drivers')

  const path = `${id}-${Date.now()}.${PHOTO_TYPES[file.type]}`
  const upload = await supabase.storage.from('driver-photos').upload(path, file, { contentType: file.type })
  if (upload.error) {
    console.error('Photo upload failed:', upload.error.message)
    redirect('/admin?error=photo-upload#drivers')
  }
  const { data } = supabase.storage.from('driver-photos').getPublicUrl(path)
  finish(await supabase.from('drivers').update({ photo_url: data.publicUrl }).eq('id', id).select('id'), 'drivers')
}

export async function uploadTrackImage(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  const file = formData.get('image')
  if (!id || !(file instanceof File) || file.size === 0) redirect('/admin?error=invalid#calendar')
  if (file.size > MAX_PHOTO_BYTES || !PHOTO_TYPES[file.type]) redirect('/admin?error=photo#calendar')

  const path = `track-${id}-${Date.now()}.${PHOTO_TYPES[file.type]}`
  const upload = await supabase.storage.from('driver-photos').upload(path, file, { contentType: file.type })
  if (upload.error) {
    console.error('Track image upload failed:', upload.error.message)
    redirect('/admin?error=photo-upload#calendar')
  }
  const { data } = supabase.storage.from('driver-photos').getPublicUrl(path)
  finish(await supabase.from('races').update({ track_image_url: data.publicUrl }).eq('id', id).select('id'), 'calendar')
}

function parseResult(formData: FormData) {
  const position = count(formData, 'position', 99)
  const points = count(formData, 'points', 999)
  return position && points !== null ? { position, points } : null
}

export async function saveResult(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  const result = parseResult(formData)
  if (!id || !result) redirect('/admin?error=invalid#results')
  finish(await supabase.from('results').update(result).eq('id', id).select('id'), 'results')
}

export async function addResult(formData: FormData) {
  const supabase = await requireUser()
  const race_id = text(formData, 'race_id', 64)
  const driver_id = text(formData, 'driver_id', 64)
  const result = parseResult(formData)
  if (!race_id || !driver_id || !result) redirect('/admin?error=invalid#results')
  finish(await supabase.from('results').insert({ race_id, driver_id, ...result }).select('id'), 'results')
}

export async function deleteResult(formData: FormData) {
  const supabase = await requireUser()
  const id = text(formData, 'id', 64)
  if (!id) redirect('/admin?error=invalid#results')
  finish(await supabase.from('results').delete().eq('id', id).select('id'), 'results')
}

export async function syncPointsFromResults() {
  const supabase = await requireUser()
  const [drivers, results] = await Promise.all([
    supabase.from('drivers').select('id'),
    supabase.from('results').select('driver_id, points'),
  ])
  if (drivers.error || results.error) {
    finish({ error: drivers.error ?? results.error, data: null }, 'drivers')
  }

  const totals = new Map<string, number>()
  for (const row of results.data ?? []) {
    totals.set(row.driver_id, (totals.get(row.driver_id) ?? 0) + (row.points ?? 0))
  }

  const updates = await Promise.all(
    (drivers.data ?? []).map((driver) =>
      supabase.from('drivers').update({ points: totals.get(driver.id) ?? 0 }).eq('id', driver.id).select('id'),
    ),
  )
  const failed = updates.find((update) => update.error)
  finish(
    { error: failed?.error ?? null, data: updates.flatMap((update) => update.data ?? []) },
    'drivers',
  )
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
