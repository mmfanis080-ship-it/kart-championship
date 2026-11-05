'use client'
import { useActionState, useState } from 'react'
import { createDriverCredentials, resetDriverPassword, revokeDriverAccount } from '@/app/admin/driver-accounts-actions'
import type { AccountActionState } from '@/app/admin/driver-accounts-actions'

const initialState: AccountActionState = { error: '', credentials: null, message: '' }
type DriverEntry = { id: string; name: string; team: string }
type ExistingAccount = { driver_id: string; username: string }

function AccountControls({ driver, selected }: {driver:DriverEntry; selected?:ExistingAccount}) {
  const [created, createAction, creating] = useActionState(createDriverCredentials, initialState)
  const [reset, resetAction, resetting] = useActionState(resetDriverPassword, initialState)
  const [revoked, revokeAction, revoking] = useActionState(revokeDriverAccount, initialState)
  const results = [created, reset].flatMap(s => s.credentials ? [s.credentials] : [])
  return <>
    <p className="my-3 text-sm">{selected ? <>Username: <strong>{selected.username}</strong></> : 'No account yet for this driver.'}</p>
    {!selected && <form action={createAction} className="flex flex-col gap-2 sm:max-w-md">
      <input type="hidden" name="driver_id" value={driver.id} />
      <label htmlFor="account-username" className="text-xs font-bold uppercase">Username (English characters)</label>
      <input id="account-username" name="username" required minLength={3} maxLength={24} pattern="[A-Za-z][A-Za-z0-9_]{2,23}" placeholder="e.g. fanis" autoComplete="off" className="min-h-11 rounded-sm border border-border bg-background px-3" />
      <button disabled={creating} type="submit" className="min-h-11 rounded-sm bg-primary px-3 font-bold text-primary-foreground disabled:opacity-50">{creating ? 'Creating…' : 'Create driver account'}</button>
    </form>}
    {selected && <div className="flex flex-wrap gap-2">
      <form action={resetAction}><input type="hidden" name="driver_id" value={driver.id}/><button type="submit" disabled={resetting} className="min-h-11 rounded-sm border border-border px-4 font-bold disabled:opacity-50">Reset password</button></form>
      <form action={revokeAction} onSubmit={e=>{if(!window.confirm(`Revoke access for ${driver.name}?`))e.preventDefault()}}><input type="hidden" name="driver_id" value={driver.id}/><button type="submit" disabled={revoking} className="min-h-11 rounded-sm border border-red-600/60 px-4 font-bold text-red-400 disabled:opacity-50">Revoke access</button></form>
    </div>}
    {[created,reset,revoked].filter(s=>s.error||s.message).map((s,i)=><p key={i} role="status" className={`mt-3 text-sm ${s.error ? 'text-red-400' : 'text-green-400'}`}>{s.error||s.message}</p>)}
    {results.map((result,index)=><div key={index} className="mt-4 rounded-sm border border-amber-500/50 bg-amber-500/5 p-4">
      <p className="mb-2 font-bold">New credentials — copy now</p>
      <p className="break-all font-mono text-sm">Username: {result.username}</p>
      <p className="break-all font-mono text-sm">Password: {result.password}</p>
      <button type="button" className="mt-3 min-h-11 rounded-sm bg-primary px-4 text-sm font-bold text-primary-foreground" onClick={()=>navigator.clipboard.writeText(`Kart Championship\nLogin: ${window.location.origin}/driver/login\nUsername: ${result.username}\nPassword: ${result.password}`)}>Copy login details</button>
      <p className="mt-2 text-xs text-muted-foreground">Shown only in this Admin response. Share privately. Reset if forgotten.</p>
    </div>)}
  </>
}

export function DriverAccountManager({ drivers, accounts }: { drivers: DriverEntry[]; accounts: ExistingAccount[] }) {
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? '')
  const selected = accounts.find(a => a.driver_id === driverId)
  const driver = drivers.find(d=>d.id===driverId)
  return <div className="rounded-sm border border-border bg-card p-4 sm:p-5">
    <h2 className="mb-2 text-xl font-black uppercase">Driver Accounts · Username & Password</h2>
    <p className="mb-4 text-sm text-muted-foreground">Create an account for each driver and share the credentials privately. The password is never stored as plaintext by the site.</p>
    <label htmlFor="account-driver" className="block text-xs font-bold uppercase">Driver</label>
    <select id="account-driver" value={driverId} onChange={e=>setDriverId(e.target.value)} className="mt-1 min-h-11 w-full rounded-sm border border-border bg-background px-3 sm:max-w-sm">
      {drivers.map(d=><option key={d.id} value={d.id}>{d.name} · {d.team}</option>)}
    </select>
    {driver && <AccountControls key={driver.id} driver={driver} selected={selected}/>}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{drivers.map(d=><div key={d.id} className="rounded-sm border border-border p-2 text-xs"><strong>{d.name}</strong> · {accounts.find(a=>a.driver_id===d.id)?.username??'Not created'}</div>)}</div>
  </div>
}
