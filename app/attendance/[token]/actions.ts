'use server'
import { redirect } from 'next/navigation'
export type VoteState={status:'idle'|'ok'|'error';message:string;choice:string|null}
export async function submitPersonalAttendance(_prev:VoteState,_form:FormData):Promise<VoteState>{redirect('/driver/login')}
