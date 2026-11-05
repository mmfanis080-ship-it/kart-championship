import { createHash } from 'node:crypto'
import { createClient } from './supabase/server'
import { isSupabaseConfigured } from './supabase/config'
export type AttendanceRace={driver_name:string;race_id:string;round:number;race_name:string;track:string|null;race_date:string|null;choice:'yes'|'maybe'|'no'|null}
export type AttendanceCount={race_id:string;yes_count:number;maybe_count:number;no_count:number}
export type AttendanceEntry={race_id:string;driver_id:string;choice:string;updated_at:string}
export type AttendanceLinkInfo={driver_id:string;expires_at:string;revoked_at:string|null}
export const isValidToken=(s:string)=>/^[a-f0-9]{64}$/.test(s)
export const tokenHash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex')
export async function getPersonalAttendance(token:string):Promise<{data:AttendanceRace[];error:string|null}>{
 if(!isSupabaseConfigured)return {data:[],error:'setup'}
 if(!isValidToken(token))return {data:[],error:'invalid'}
 const supabase=await createClient()
 const {data,error}=await supabase.rpc('attendance_for_token',{p_token_hash:tokenHash(token)})
 return error?{data:[],error:error.code==='PGRST202'?'setup':'unavailable'}:{data:(data??[]) as AttendanceRace[],error:null}
}
export async function getAttendanceCounts():Promise<AttendanceCount[]>{
 if(!isSupabaseConfigured)return []
 try { const supabase=await createClient();const {data,error}=await supabase.rpc('attendance_overview');
  if(error)return []
  return ((data??[]) as AttendanceCount[]).map(row=>({...row,yes_count:Number(row.yes_count),maybe_count:Number(row.maybe_count),no_count:Number(row.no_count)}))
 }catch{return []}
}

export type AttendancePublicEntry={race_id:string;driver_id:string;driver_name:string;team:string;choice:'yes'|'maybe'|'no'}
/** Safe public roster: exposes only the name/team already visible in championship standings. */
export async function getAttendancePublicRoster():Promise<AttendancePublicEntry[]>{
 if(!isSupabaseConfigured)return []
 try{const supabase=await createClient();const {data,error}=await supabase.rpc('attendance_public_roster');if(error)return [];return (data??[]) as AttendancePublicEntry[]}catch{return []}
}
