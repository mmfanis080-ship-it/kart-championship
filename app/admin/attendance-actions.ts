'use server'
import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/driver-session'
import { tokenHash } from '@/lib/attendance'
export type LinkState={status:'idle'|'ok'|'error';link:string;message:string}
export async function rotatePersonalLink(_prev:LinkState,formData:FormData):Promise<LinkState>{
 const id=String(formData.get('driver_id')??'')
 if(!/^[0-9a-f-]{36}$/i.test(id))return {status:'error',link:'',message:'Invalid driver ID'}
 const {supabase}=await requireAdminSession()
 const token=randomBytes(32).toString('hex')
 const {data,error}=await supabase.rpc('admin_rotate_attendance_link',{p_driver_id:id,p_token_hash:tokenHash(token),p_expires_at:new Date(Date.now()+180*86400000).toISOString()})
 if(error||data!==true){console.error('Link generation failed:',error?.code??'not-admin');return {status:'error',link:'',message:'Run SQL 006 and check that your user is an admin.'}}
 revalidatePath('/admin')
 return {status:'ok',link:`/attendance/${token}`,message:'Copy this personal link NOW. It is shown only once. The old link was revoked.'}
}
export async function revokePersonalLink(formData:FormData){
 const id=String(formData.get('driver_id')??'')
 if(!/^[0-9a-f-]{36}$/i.test(id))redirect('/admin?error=invalid#attendance-links')
 const {supabase}=await requireAdminSession()
 const {data,error}=await supabase.rpc('admin_revoke_attendance_link',{p_driver_id:id})
 if(error||data!==true)redirect('/admin?error=attendance#attendance-links')
 revalidatePath('/admin');redirect('/admin?saved=1#attendance-links')
}
