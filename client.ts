import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabaseAnonKey, supabaseUrl } from './config'

let client: SupabaseClient | undefined

export function createClient() {
  if (!client) {
    client = createBrowserClient(supabaseUrl!, supabaseAnonKey!, {
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    })
  }
  return client
}
