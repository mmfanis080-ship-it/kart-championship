'use client'
import { useActionState } from 'react'
import { submitAwardVote } from '@/app/driver/actions'
export function AwardVoteForm({awardId,nominees,chosen}:{awardId:string; nominees:{id:string;name:string;title?:string|null}[];chosen:string|null}) {
 const [state,action,pending]=useActionState(submitAwardVote,{ok:false,message:''})
 return <form action={action} className="rounded-sm border border-border bg-card p-4"><input type="hidden" name="award_id" value={awardId}/><fieldset className="flex flex-col gap-2"><legend className="mb-2 text-xs font-bold uppercase text-primary">Cast your vote</legend>{nominees.map(n=><label key={n.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-sm border border-border px-3 py-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5"><input type="radio" name="nominee_id" value={n.id} defaultChecked={n.id===chosen} required className="size-4 shrink-0 accent-primary"/><span className="min-w-0"><span className="block text-sm font-bold uppercase">{n.name}</span>{n.title&&<span className="mt-0.5 block break-words text-xs text-muted-foreground">{n.title}</span>}</span></label>)}</fieldset>
 <button type="submit" disabled={pending||!nominees.length} className="mt-4 min-h-11 rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground">{pending?'Saving…':'Save vote'}</button>{state.message&&<p role="status" className={state.ok?'mt-2 text-emerald-400':'mt-2 text-red-400'}>{state.message}</p>}</form>
}
