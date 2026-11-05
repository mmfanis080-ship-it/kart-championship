'use server'
import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/driver-session'
import { createAdminClient } from '@/lib/supabase/admin'
import { driverAuthEmail, normalizeDriverUsername } from '@/lib/driver-username'

type Credentials = { username: string; password: string; driverName: string }
export type AccountActionState = { error: string; credentials: Credentials | null; message: string }
const emptyAccountState: AccountActionState = { error: '', credentials: null, message: '' }
const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
const generatePassword = () => randomBytes(18).toString('base64url')

/** Create one account per existing driver, verified server-side. Password is returned once, not persisted as plaintext. */
export async function createDriverCredentials(_previous: AccountActionState, form: FormData): Promise<AccountActionState> {
  await requireAdminSession()
  const driverId = String(form.get('driver_id') ?? '')
  const username = normalizeDriverUsername(String(form.get('username') ?? ''))
  if (!validId(driverId) || !username) return { ...emptyAccountState, error: 'Choose a driver and a username (3–24 characters: a-z, 0-9, _).' }
  let admin
  try { admin = createAdminClient() } catch { return { ...emptyAccountState, error: 'Configure SUPABASE_SERVICE_ROLE_KEY in Vercel first.' } }
  const { data: driver, error: driverError } = await admin.from('drivers').select('id,name').eq('id',driverId).maybeSingle()
  if (driverError || !driver) return { ...emptyAccountState, error: 'Driver not found.' }
  const { data: existing, error: lookupError } = await admin.from('driver_username_accounts').select('driver_id,username').or(`driver_id.eq.${driverId},username.eq.${username}`).limit(1)
  if (lookupError) return { ...emptyAccountState, error: 'Run migration 009 before creating accounts.' }
  if (existing?.length) return { ...emptyAccountState, error: 'This driver or username already has an account. Use Reset Password if needed.' }
  const password = generatePassword()
  const { data: authData, error: authError } = await admin.auth.admin.createUser({ email: driverAuthEmail(username), password, email_confirm: true })
  if (authError || !authData.user) return { ...emptyAccountState, error: 'Account creation failed. Try another username.' }
  const { error: mappingError } = await admin.from('driver_username_accounts').insert({ driver_id: driverId, auth_user_id: authData.user.id, username })
  if (mappingError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { ...emptyAccountState, error: 'Account could not be linked to this driver.' }
  }
  revalidatePath('/admin')
  return { error: '', message: 'Account created. Copy these credentials now; the password will not be shown again.', credentials: { username, password, driverName: driver.name } }
}

/** Reset without knowing or displaying the previous password. */
export async function resetDriverPassword(_previous: AccountActionState, form: FormData): Promise<AccountActionState> {
  await requireAdminSession()
  const driverId = String(form.get('driver_id') ?? '')
  if (!validId(driverId)) return { ...emptyAccountState, error: 'Choose a driver.' }
  let admin
  try { admin = createAdminClient() } catch { return { ...emptyAccountState, error: 'Configure SUPABASE_SERVICE_ROLE_KEY in Vercel first.' } }
  const { data: account, error } = await admin.from('driver_username_accounts').select('username,auth_user_id').eq('driver_id',driverId).maybeSingle()
  if (error || !account) return { ...emptyAccountState, error: 'Driver account was not found.' }
  const password = generatePassword()
  const { error: resetError } = await admin.auth.admin.updateUserById(account.auth_user_id, { password })
  if (resetError) return { ...emptyAccountState, error: 'Password reset failed.' }
  return { error: '', message: 'Password reset. Send the new password privately; the previous password no longer works.', credentials: { username: account.username, password, driverName: 'Driver' } }
}

export async function revokeDriverAccount(_previous: AccountActionState, form: FormData): Promise<AccountActionState> {
  await requireAdminSession()
  const driverId = String(form.get('driver_id') ?? '')
  if (!validId(driverId)) return { ...emptyAccountState, error: 'Choose a driver.' }
  let admin
  try { admin = createAdminClient() } catch { return { ...emptyAccountState, error: 'Configure SUPABASE_SERVICE_ROLE_KEY in Vercel first.' } }
  const { data: account, error } = await admin.from('driver_username_accounts').select('auth_user_id').eq('driver_id',driverId).maybeSingle()
  if (error || !account) return { ...emptyAccountState, error: 'Driver account was not found.' }
  const { error: revokeError } = await admin.from('driver_username_accounts').delete().eq('driver_id',driverId)
  if (revokeError) return { ...emptyAccountState, error: 'Could not revoke account.' }
  const { error: deleteError } = await admin.auth.admin.deleteUser(account.auth_user_id)
  if (deleteError) return { ...emptyAccountState, error: 'Driver access revoked, but could not delete the Auth user. Check Supabase dashboard.' }
  revalidatePath('/admin')
  return { ...emptyAccountState, message: 'Driver account revoked.' }
}
