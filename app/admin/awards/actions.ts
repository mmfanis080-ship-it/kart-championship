'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/driver-session'
const uuid=(x:string)=>/^[0-9a-f-]{36}$/i.test(x)
export async function createAward(form:FormData){
 const {supabase}=await requireAdminSession()
 const title=String(form.get('title')??'').trim()
 const kind=String(form.get('kind')??'')
 const opens=String(form.get('opens_at')??'')
 const closes=String(form.get('closes_at')??'')
 const published=form.get('published')==='on'
 const opensTime=new Date(opens).getTime(),closesTime=new Date(closes).getTime()
 if(title.length<2||title.length>120||!['driver_of_the_day','overtake_of_the_month'].includes(kind)||!Number.isFinite(opensTime)||!Number.isFinite(closesTime)||closesTime<=opensTime)redirect('/admin/awards?error=invalid')
 const raceId=String(form.get('race_id')??'')
 if(raceId&&!uuid(raceId))redirect('/admin/awards?error=invalid')
 const {error}=await supabase.from('award_events').insert({title,kind,opens_at:new Date(opensTime).toISOString(),closes_at:new Date(closesTime).toISOString(),published,race_id:raceId||null})
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?saved=1')
}
export async function addNominee(form:FormData){
 const {supabase}=await requireAdminSession()
 const awardId=String(form.get('award_id')??''),driverId=String(form.get('driver_id')??''),title=String(form.get('title')??'').trim(),path=String(form.get('video_path')??'').trim()
 if(!uuid(awardId)||!uuid(driverId)||title.length>150||(path&&(!/^overtakes\/[a-zA-Z0-9_./-]+\.mp4$/.test(path)||path.includes('..'))))redirect('/admin/awards?error=invalid')
 const {data:event}=await supabase.from('award_events').select('kind').eq('id',awardId).single()
 if(!event||event.kind==='driver_of_the_day'&&path)redirect('/admin/awards?error=invalid')
 const {error}=await supabase.from('award_nominees').insert({award_id:awardId,driver_id:driverId,title,video_path:path||null})
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?saved=1')
}
export async function setAwardPublished(form:FormData){
 const {supabase}=await requireAdminSession();const id=String(form.get('award_id')??'')
 if(!uuid(id))redirect('/admin/awards?error=invalid')
 const {error}=await supabase.from('award_events').update({published:form.get('published')==='true'}).eq('id',id)
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?saved=1')
}

/** All edits and deletes require the verified admin role; RLS enforces it again in Supabase. */
export async function updateAward(form: FormData) {
 const {supabase}=await requireAdminSession()
 const id=String(form.get('award_id')??'')
 const title=String(form.get('title')??'').trim()
 const kind=String(form.get('kind')??'')
 const opens=String(form.get('opens_at')??'')
 const closes=String(form.get('closes_at')??'')
 const raceId=String(form.get('race_id')??'')
 const opensTime=Date.parse(`${opens}Z`), closesTime=Date.parse(`${closes}Z`)
 if(!uuid(id)||title.length<2||title.length>120||!['driver_of_the_day','overtake_of_the_month'].includes(kind)||!Number.isFinite(opensTime)||!Number.isFinite(closesTime)||closesTime<=opensTime||(raceId&&!uuid(raceId)))redirect('/admin/awards?error=invalid')
 const {error}=await supabase.from('award_events').update({title,kind,opens_at:new Date(opensTime).toISOString(),closes_at:new Date(closesTime).toISOString(),race_id:raceId||null,published:form.get('published')==='on'}).eq('id',id)
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?saved=1')
}
export async function deleteAward(form: FormData) {
 const {supabase}=await requireAdminSession()
 const id=String(form.get('award_id')??'')
 if(!uuid(id))redirect('/admin/awards?error=invalid')
 // FK ON DELETE CASCADE: nominees and their votes are removed with the award.
 // Video storage objects are intentionally preserved and can be reused or removed separately.
 const {error}=await supabase.from('award_events').delete().eq('id',id)
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?deleted=1')
}
export async function updateNominee(form: FormData) {
 const {supabase}=await requireAdminSession()
 const id=String(form.get('nominee_id')??'')
 const driverId=String(form.get('driver_id')??'')
 const title=String(form.get('title')??'').trim()
 const path=String(form.get('video_path')??'').trim()
 if(!uuid(id)||!uuid(driverId)||title.length>150||(path&&(!/^overtakes\/[a-zA-Z0-9_./-]+\.mp4$/.test(path)||path.includes('..'))))redirect('/admin/awards?error=invalid')
 const {data:nominee,error:lookupError}=await supabase.from('award_nominees').select('award_id').eq('id',id).single()
 if(lookupError||!nominee)redirect('/admin/awards?error=invalid')
 const {data:event,error:eventError}=await supabase.from('award_events').select('kind').eq('id',nominee.award_id).single()
 if(eventError||!event||event.kind==='driver_of_the_day'&&path)redirect('/admin/awards?error=invalid')
 const {error}=await supabase.from('award_nominees').update({driver_id:driverId,title,video_path:path||null}).eq('id',id)
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?saved=1')
}
export async function deleteNominee(form: FormData) {
 const {supabase}=await requireAdminSession()
 const id=String(form.get('nominee_id')??'')
 if(!uuid(id))redirect('/admin/awards?error=invalid')
 // Votes for a deleted nominee are also removed by the existing FK.
 const {error}=await supabase.from('award_nominees').delete().eq('id',id)
 if(error)redirect('/admin/awards?error=save')
 revalidatePath('/admin/awards');revalidatePath('/awards');revalidatePath('/driver');redirect('/admin/awards?deleted=1')
}
