'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error || !isAdmin) redirect('/admin')
  return { supabase, user }
}

export async function publishStartingGrid(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  let driverIds: unknown
  try { driverIds = JSON.parse(String(formData.get('driver_ids') ?? '')) } catch { redirect('/admin/starting-grid?error=invalid') }
  if (!Array.isArray(driverIds) || driverIds.length < 1 || driverIds.length > 100 ||
    !driverIds.every(id => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) ||
    new Set(driverIds).size !== driverIds.length) redirect('/admin/starting-grid?error=invalid')
  const { data: existing, error: driversError } = await supabase.from('drivers').select('id').in('id', driverIds)
  if (driversError || !existing || existing.length !== driverIds.length) redirect('/admin/starting-grid?error=invalid')
  const { error } = await supabase.from('published_starting_grid').upsert({
    id: true, driver_ids: driverIds, updated_by: user.id, updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })
  if (error) redirect('/admin/starting-grid?error=save')
  revalidatePath('/starting-grid'); revalidatePath('/admin/starting-grid')
  redirect('/admin/starting-grid?saved=1')
}

export async function clearStartingGrid() {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from('published_starting_grid').delete().eq('id', true)
  if (error) redirect('/admin/starting-grid?error=save')
  revalidatePath('/starting-grid'); revalidatePath('/admin/starting-grid')
  redirect('/admin/starting-grid?cleared=1')
}
