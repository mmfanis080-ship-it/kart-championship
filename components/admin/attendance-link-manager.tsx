'use client'
import { useActionState,useState } from 'react'
import { rotatePersonalLink,revokePersonalLink,type LinkState } from '@/app/admin/attendance-actions'
import type { AttendanceEntry,AttendanceLinkInfo } from '@/lib/attendance'
import type { Driver } from '@/lib/championship'
const initialLinkState:LinkState={status:'idle',link:'',message:''}
function LinkRow({driver,info,entries}:{driver:Driver;info?:AttendanceLinkInfo;entries:AttendanceEntry[]}){
 const [state,action,pending]=useActionState(rotatePersonalLink,initialLinkState)
 const [copied,setCopied]=useState(false)
 const active=info&&!info.revoked_at&&new Date(info.expires_at)>new Date()
 const own=entries.filter(e=>e.driver_id===driver.id)
 return <div className="rounded-sm border border-border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold uppercase">{driver.name}</p><p className="text-xs text-muted-foreground">{driver.team} · {active?`Active until ${new Date(info.expires_at).toLocaleDateString('en-GB')}`:'No active link'}</p><p className="mt-2 font-mono text-xs">Yes {own.filter(e=>e.choice==='yes').length} · Maybe {own.filter(e=>e.choice==='maybe').length} · No {own.filter(e=>e.choice==='no').length}</p></div><div className="flex gap-2"><form action={action}><input type="hidden" name="driver_id" value={driver.id}/><button type="submit" disabled={pending} className="rounded-sm bg-primary px-3 py-2 text-xs font-bold uppercase text-primary-foreground">{pending?'Creating...':'Create / rotate link'}</button></form><form action={revokePersonalLink}><input type="hidden" name="driver_id" value={driver.id}/><button disabled={!active&&state.status!=='ok'} className="rounded-sm border border-border px-3 py-2 text-xs font-bold uppercase disabled:opacity-40">Revoke</button></form></div></div>
 {state.status==='ok'&&<div className="mt-4 rounded-sm border border-primary/40 p-3"><p className="text-xs text-muted-foreground">One-time link. Copy the FULL URL using the button:</p><p className="mt-2 break-all font-mono text-xs">{state.link}</p><button type="button" className="mt-3 rounded-sm border border-primary px-3 py-2 text-xs font-bold" onClick={async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}${state.link}`);setCopied(true)}catch{setCopied(false)}}}>{copied?'Copied':'Copy full link'}</button><p className="mt-2 text-xs text-muted-foreground">{state.message}</p></div>}
 {state.status==='error'&&<p role="alert" className="mt-2 text-sm text-red-400">{state.message}</p>}
 </div>
}
export function AttendanceLinkManager({drivers,links,entries}:{drivers:Driver[];links:AttendanceLinkInfo[];entries:AttendanceEntry[]}){
 const map=new Map(links.map(l=>[l.driver_id,l]))
 return <div className="grid gap-3">{drivers.map(d=><LinkRow key={d.id} driver={d} info={map.get(d.id)} entries={entries}/>)}</div>
}
