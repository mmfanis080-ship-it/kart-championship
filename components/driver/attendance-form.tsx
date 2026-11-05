'use client'
import { useActionState } from 'react'
import { saveDriverAttendance } from '@/app/driver/actions'
export function DriverAttendanceForm({raceId,initial}:{raceId:string;initial:string|null}) {
 const [state,action,pending] = useActionState(saveDriverAttendance,{ok:false,message:''})
 return <form action={action} className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4"><input type="hidden" name="race_id" value={raceId}/>
 <fieldset className="flex flex-wrap gap-4"><legend className="mb-2 font-bold uppercase">My attendance</legend>{(['yes','maybe','no'] as const).map(c=><label className="flex cursor-pointer items-center gap-2" key={c}><input type="radio" name="choice" value={c} defaultChecked={c===initial} required/>{c==='yes'?'Going':c==='maybe'?'Maybe':'Not going'}</label>)}</fieldset>
 <button disabled={pending} type="submit" className="min-h-11 rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground disabled:opacity-50">Save attendance</button>{state.message&&<p role="status" className={state.ok?'text-emerald-400':'text-red-400'}>{state.message}</p>}
 </form>
}
