'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/driver-session'
export async function assignDriverEmail(form:FormData){
 const {supabase}=await requireAdminSession()
 const id=String(form.get('driver_id')??'')
 const email=String(form.get('email')??'').trim().toLowerCase()
 if(!/^[0-9a-f-]{36}$/i.test(id)||!/^\S+@\S+\.\S+$/.test(email)||email.length>254) redirect('/admin?error=invalid#driver-accounts')
 const {error}=await supabase.from('driver_login_emails').upsert({driver_id:id,email},{onConflict:'driver_id'})
 if(error)redirect('/admin?error=save-failed#driver-accounts')
 revalidatePath('/admin');redirect('/admin?saved=1#driver-accounts')
}
export async function removeDriverEmail(form:FormData){
 const {supabase}=await requireAdminSession()
 const id=String(form.get('driver_id')??'')
 if(!/^[0-9a-f-]{36}$/i.test(id))redirect('/admin?error=invalid#driver-accounts')
 const {error}=await supabase.from('driver_login_emails').delete().eq('driver_id',id)
 if(error)redirect('/admin?error=save-failed#driver-accounts')
 revalidatePath('/admin');redirect('/admin?saved=1#driver-accounts')
}
