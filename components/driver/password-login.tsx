'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { driverAuthEmail, normalizeDriverUsername } from '@/lib/driver-username'

export function PasswordLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalized = normalizeDriverUsername(username)
    if (!normalized || !password) { setError('Enter a valid username and password.'); return }
    setBusy(true)
    const { error: authError } = await createClient().auth.signInWithPassword({email:driverAuthEmail(normalized),password})
    if (authError) setError('Incorrect username or password. Ask Race Control to reset your password.')
    else { router.replace('/driver'); router.refresh() }
    setBusy(false)
  }
  return <div className="rounded-sm border border-border bg-card p-5 sm:p-8">
    <h2 className="mb-2 text-2xl font-black uppercase italic">Driver sign in</h2>
    <p className="mb-6 text-sm text-muted-foreground">Use the username and password provided by Race Control. No email needed.</p>
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label htmlFor="driver-username" className="text-xs font-bold uppercase">Username</label>
      <input id="driver-username" required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} className="min-h-12 rounded-sm border border-border bg-background px-3" />
      <label htmlFor="driver-password" className="text-xs font-bold uppercase">Password</label>
      <input id="driver-password" required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="min-h-12 rounded-sm border border-border bg-background px-3" />
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button disabled={busy} type="submit" className="min-h-12 rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <p className="mt-4 text-xs text-muted-foreground">Forgot your password? Contact the Admin for a new one.</p>
  </div>
}
