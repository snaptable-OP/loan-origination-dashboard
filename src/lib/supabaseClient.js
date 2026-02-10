import { createClient } from '@supabase/supabase-js'

// Client-side Supabase configuration
// In Vite, environment variables are accessed via import.meta.env
// They must be prefixed with VITE_ to be exposed to the client

// Client-side Supabase configuration
// In Vite, environment variables are accessed via import.meta.env
// They must be prefixed with VITE_ to be exposed to the client

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzodexvvxyyndilxtmsm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ'

// Always create client, even if env vars are missing (will use fallback values)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})
