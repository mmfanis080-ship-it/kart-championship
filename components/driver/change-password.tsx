'use client'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ChangeDriverPassword() {
  const [password,setPassword] = useState('')
  const [repeat,setRepeat] = useState('')
  const [busy,setBusy] = useState(false)
  const [status,setStatus] = useState('')
  const [error,setError] = useState('')
  async function change(e:FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('');setStatus('')
    if(password.length<12 || password!==repeat) {setError('Use at least 12 characters and make sure both entries match.');return}
    setBusy(true)
    const {error:authError} = await createClient().auth.updateUser({password})
    if(authError) setError('Could not update password. Try signing in again or contact Race Control.')
    else {setStatus('Password updated.');setPassword('');setRepeat('')}
    setBusy(false)
  }
  return <details className="rounded-sm border border-border bg-card p-4">
    <summary className="cursor-pointer font-bold uppercase">Change my password</summary>
    <form className="mt-4 flex max-w-md flex-col gap-3" onSubmit={change}>
      <label htmlFor="new-driver-password" className="text-xs font-bold uppercase">New password (at least 12 characters)</label>
      <input id="new-driver-password" className="min-h-11 rounded-sm border border-border bg-background px-3" required type="password" minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <label htmlFor="repeat-driver-password" className="text-xs font-bold uppercase">Repeat new password</label>
      <input id="repeat-driver-password" className="min-h-11 rounded-sm border border-border bg-background px-3" required type="password" minLength={12} autoComplete="new-password" value={repeat} onChange={e=>setRepeat(e.target.value)}/>
      {error&&<p role="alert" className="text-sm text-red-400">{error}</p>}
      {status&&<p role="status" className="text-sm text-green-400">{status}</p>}
      <button type="submit" disabled={busy} className="min-h-11 rounded-sm bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">{busy?'Saving…':'Update password'}</button>
    </form>
  </details>
}
