'use client'
import { useActionState } from 'react'
import { submitPersonalAttendance,type VoteState } from '@/app/attendance/[token]/actions'
import type { AttendanceRace } from '@/lib/attendance'
import { formatDate } from '@/lib/format'
const initial:VoteState={status:'idle',message:'',choice:null}
export function AttendanceVoteForm({race,token}:{race:AttendanceRace;token:string}){
 const [state,action,pending]=useActionState(submitPersonalAttendance,initial)
 const current=state.choice??race.choice
 return <form action={action} className="rounded-sm border border-border bg-card p-5">
  <input type="hidden" name="token" value={token}/><input type="hidden" name="race_id" value={race.race_id}/>
  <p className="font-mono text-xs uppercase text-primary">Round {race.round}</p><h2 className="mt-2 text-xl font-black uppercase">{race.race_name}</h2><p className="text-sm text-muted-foreground">{race.track??'TBC'} · {formatDate(race.race_date)}</p>
  <fieldset disabled={pending} className="mt-4 flex flex-wrap gap-2"><legend className="mb-3 text-xs font-bold uppercase">Your attendance</legend>{([['yes','✓ Yes'],['maybe','? Maybe'],['no','✕ No']] as const).map(([value,label])=><label key={value} className={`cursor-pointer rounded-sm border px-4 py-2 text-sm font-semibold ${current===value?'border-primary text-primary':'border-border'}`}><input type="radio" className="mr-2 accent-red-500" name="choice" value={value} defaultChecked={race.choice===value} required/>{label}</label>)}</fieldset>
  <div className="mt-4 flex items-center gap-3"><button type="submit" disabled={pending} className="rounded-sm bg-primary px-5 py-2 font-bold uppercase text-primary-foreground disabled:opacity-60">{pending?'Saving...':'Save'}</button>{current&&<p className="text-xs text-muted-foreground">Saved answer: {current.toUpperCase()}</p>}</div>
  {state.message&&<p role="status" className={`mt-2 text-sm ${state.status==='error'?'text-red-400':'text-emerald-400'}`}>{state.message}</p>}
 </form>
}
