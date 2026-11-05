import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getDriverSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, driverId: null as string | null, admin: false }
  const [driver, admin] = await Promise.all([supabase.rpc('my_driver_id'),supabase.rpc('is_admin')])
  return { supabase, user, driverId: driver.error ? null : (driver.data as string | null), admin: admin.error ? false : admin.data === true }
}

export async function requireAdminSession() {
  const session = await getDriverSession()
  if (!session.user) redirect('/auth/login')
  if (!session.admin) redirect('/driver')
  return session
}

export async function requireDriverSession() {
  const session = await getDriverSession()
  if (!session.user) redirect('/driver/login')
  if (!session.driverId) redirect('/driver/unlinked')
  return { ...session, driverId: session.driverId }
}
