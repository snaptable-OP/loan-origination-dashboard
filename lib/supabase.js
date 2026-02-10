import { createClient } from '@supabase/supabase-js';

// Note: dotenv is not needed in Vercel - environment variables are automatically available
// In Vercel, environment variables are automatically injected, so we don't need dotenv

const supabaseUrl = process.env.SUPABASE_URL;
// Prefer service role key for server-side operations (bypasses RLS)
// Fall back to anon key if service role key is not available
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your Vercel environment variables.');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️  Warning: Using ANON key instead of SERVICE_ROLE key. For server-side operations, use SERVICE_ROLE key to bypass RLS.');
}

// Create Supabase client
// Use service role key for server-side operations (bypasses RLS)
// Use anon key for client-side operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
