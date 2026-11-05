'use client'
import { useActionState } from 'react'
import { saveDriverAttendance } from '@/app/driver/actions'

export function AttendanceQuickForm({raceId,initial}:{raceId:string;initial:string|null}) {
 const [state,action,pending]=useActionState(saveDriverAttendance,{ok:false,message:'',choice:initial})
 const selected=state.ok ? (state.choice ?? null) : initial
 return <form action={action} className="flex min-w-0 flex-wrap items-center gap-2">
   <input type="hidden" name="race_id" value={raceId}/>
   <button type="submit" name="choice" value="yes" disabled={pending} aria-pressed={selected==='yes'} className={`min-h-11 rounded-md px-3 py-2 text-xs font-bold transition-colors disabled:opacity-60 ${selected==='yes'?'bg-emerald-600 text-white ring-2 ring-emerald-400':'bg-emerald-600 text-white hover:bg-emerald-500'}`}>✓ Accept</button>
   <button type="submit" name="choice" value="no" disabled={pending} aria-pressed={selected==='no'} className={`min-h-11 rounded-md border px-3 py-2 text-xs font-bold disabled:opacity-60 ${selected==='no'?'border-red-400 bg-red-500/20 text-red-400':'border-border hover:border-red-400 hover:text-red-400'}`}>× Decline</button>
   <button type="submit" name="choice" value="maybe" disabled={pending} aria-pressed={selected==='maybe'} className={`min-h-11 rounded-md border px-3 py-2 text-xs font-bold disabled:opacity-60 ${selected==='maybe'?'border-amber-400 bg-amber-500/20 text-amber-400':'border-border hover:text-amber-400'}`}>? Maybe</button>
   {selected && <button type="submit" name="choice" value="clear" disabled={pending} className="min-h-11 px-2 py-2 text-xs text-muted-foreground underline underline-offset-2 disabled:opacity-60">Clear</button>}
   {state.message && <p role="status" className={`w-full text-xs ${state.ok?'text-emerald-500':'text-red-400'}`}>{state.message}</p>}
 </form>
}
