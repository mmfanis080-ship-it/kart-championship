'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { fieldClass, labelClass } from '@/components/form-styles'

function describeAuthError(error: { message: string; status?: number; code?: string }) {
  if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (error.code === 'email_not_confirmed') return 'Please confirm your email address before signing in.'
  if (error.code === 'invalid_credentials' || error.status === 400) return 'Invalid email or password.'
  if (!error.status) return 'Could not reach Supabase. Check your connection and try again.'
  return 'Sign-in failed unexpectedly. Please try again.'
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Supabase sign-in failed:', error.status, error.code)
        setError(describeAuthError(error))
        setLoading(false)
        return
      }
      router.replace('/admin')
      router.refresh()
    } catch (cause) {
      console.error('Supabase sign-in threw:', cause)
      setError('Could not reach Supabase. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={loading} className="h-11 font-bold uppercase tracking-wider">
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
