import { createClient } from '@supabase/supabase-js'

// Client-side Supabase configuration
// In Vite, environment variables are accessed via import.meta.env
// They must be prefixed with VITE_ to be exposed to the client

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzodexvvxyyndilxtmsm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables for client')
  console.warn('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})
