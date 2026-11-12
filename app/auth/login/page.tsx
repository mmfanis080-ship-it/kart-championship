import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { SiteHeader } from '@/components/site-header'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = {
  title: 'Admin Login | Kart Championship',
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-sm overflow-hidden rounded-sm border border-border bg-card p-8">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="mb-8 flex flex-col gap-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Race Control</p>
            <h1 className="text-3xl font-black uppercase italic tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Sign in to update drivers, points and the race calendar.</p>
          </div>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p role="status" className="rounded-sm border border-primary/30 bg-primary/10 p-4 text-sm leading-relaxed">
              Admin login needs Supabase. Connect the Supabase integration in project settings to enable sign-in.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
