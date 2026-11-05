'use server'
import { revalidatePath } from 'next/cache'
import { requireDriverSession } from '@/lib/driver-session'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type DriverFormState = { message: string; ok: boolean; choice?: string | null }
export async function saveDriverAttendance(_previous: DriverFormState, form: FormData): Promise<DriverFormState> {
  const { supabase, driverId } = await requireDriverSession()
  const race = String(form.get('race_id')??'')
  const choice = String(form.get('choice')??'')
  if(!/^[0-9a-f-]{36}$/i.test(race) || !['yes','maybe','no','clear'].includes(choice)) return {ok:false,message:'Invalid selection.'}
  const {data:validRace,error:rError}=await supabase.from('races').select('id').eq('id',race).maybeSingle()
  const {count,error:cError}=await supabase.from('results').select('id',{head:true,count:'exact'}).eq('race_id',race)
  if (rError||cError||!validRace||count) return {ok:false,message:'This race is no longer open for attendance.'}
  const {error} = choice==='clear'
    ? await supabase.from('attendance_entries').delete().eq('race_id',race).eq('driver_id',driverId)
    : await supabase.from('attendance_entries').upsert({race_id:race,driver_id:driverId,choice,updated_at:new Date().toISOString()},{onConflict:'race_id,driver_id'})
  if(error) return {ok:false,message:'Could not save attendance. Verify that migration 008 was run.'}
  revalidatePath('/driver');revalidatePath('/');revalidatePath('/admin')
  return {ok:true,message:choice==='clear'?'Answer cleared.':'Attendance saved.',choice:choice==='clear'?null:choice}
}

export async function submitAwardVote(_previous: DriverFormState, form: FormData): Promise<DriverFormState> {
  const {supabase} = await requireDriverSession()
  const eventId=String(form.get('award_id')??'')
  const nomineeId=String(form.get('nominee_id')??'')
  if(!/^[0-9a-f-]{36}$/i.test(eventId)||!/^[0-9a-f-]{36}$/i.test(nomineeId))return {ok:false,message:'Choose a candidate.'}
  const {data,error} = await supabase.rpc('cast_award_vote',{p_award_id:eventId,p_nominee_id:nomineeId})
  if(error||data!==true)return {ok:false,message:'Voting is closed, or your driver account is not approved.'}
  revalidatePath('/driver');revalidatePath('/awards')
  return {ok:true,message:'Your vote was saved. You can change it before the deadline.'}
}

export async function signOutDriver(){
  const supabase=await createClient()
  await supabase.auth.signOut()
  redirect('/driver/login')
}
