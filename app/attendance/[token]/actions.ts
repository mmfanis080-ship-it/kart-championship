'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidToken,tokenHash } from '@/lib/attendance'
export type VoteState={status:'idle'|'ok'|'error';message:string;choice:string|null}
export async function submitPersonalAttendance(_prev:VoteState,formData:FormData):Promise<VoteState>{
 const token=String(formData.get('token')??''),raceId=String(formData.get('race_id')??''),choice=String(formData.get('choice')??'')
 if(!isValidToken(token)||!/^[0-9a-f-]{36}$/i.test(raceId)||!['yes','maybe','no'].includes(choice))return {status:'error',message:'Invalid selection',choice:null}
 const supabase=await createClient()
 const {data,error}=await supabase.rpc('attendance_submit',{p_token_hash:tokenHash(token),p_race_id:raceId,p_choice:choice})
 if(error||data!==true)return {status:'error',message:'Not saved. Your link may have expired, or race results have been entered.',choice:null}
 revalidatePath('/');revalidatePath('/admin');revalidatePath(`/attendance/${token}`)
 return {status:'ok',message:'Attendance saved successfully.',choice}
}
