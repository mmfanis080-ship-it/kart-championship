'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OtpLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function send(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    const { error } = await createClient().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } })
    if (error) setError('Could not send a code. Check your address, wait a moment and try again.')
    else setSent(true)
    setBusy(false)
  }
  async function verify(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('')
    if (!/^\d{6}$/.test(code)) { setError('Enter your six-digit code.'); setBusy(false); return }
    const { error } = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: 'email' })
    if (error) { setError('Invalid or expired code. Request another code.'); setBusy(false); return }
    router.replace('/driver'); router.refresh()
  }
  return <div className="rounded-sm border border-border bg-card p-5 sm:p-8">
    <h2 className="mb-2 text-2xl font-black uppercase italic">Driver sign in</h2>
    <p className="mb-6 text-sm text-muted-foreground">Use the email address Race Control assigned to your driver profile.</p>
    <form onSubmit={sent ? verify : send} className="flex flex-col gap-4">
      <label htmlFor="driver-email" className="text-xs font-bold uppercase">Email</label>
      <input id="driver-email" required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} disabled={sent} className="min-h-12 rounded-sm border border-border bg-background px-3" />
      {sent && <><label htmlFor="driver-otp" className="text-xs font-bold uppercase">6-digit code</label><input id="driver-otp" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0,6))} className="min-h-12 rounded-sm border border-border bg-background px-3 text-xl tracking-widest" /></>}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {sent && <p className="text-xs text-muted-foreground">Check your inbox and spam folder. Codes expire; request a new one if needed.</p>}
      <button disabled={busy} type="submit" className="min-h-12 rounded-sm bg-primary px-5 font-bold uppercase text-primary-foreground disabled:opacity-50">{busy?'Working…':sent?'Verify and sign in':'Send login code'}</button>
      {sent && <button type="button" onClick={()=>{setSent(false);setCode('');setError('')}} className="min-h-11 text-sm text-muted-foreground underline">Request another code / change email</button>}
    </form>
  </div>
}
