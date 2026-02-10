// Temporary test endpoint to verify environment variables
// REMOVE THIS FILE AFTER TESTING for security
export default async function handler(req, res) {
  // Only allow in development/preview, not production
  if (process.env.VERCEL_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  return res.status(200).json({
    message: 'Environment variables check',
    variables: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SNAPTABLE_API_URL: process.env.SNAPTABLE_API_URL ? '✅ Set' : '❌ Missing',
      SNAPTABLE_API_TOKEN: process.env.SNAPTABLE_API_TOKEN ? '✅ Set' : '❌ Missing',
    },
    // Show partial values for verification (first 10 chars)
    partialValues: {
      SUPABASE_URL: process.env.SUPABASE_URL?.substring(0, 30) + '...',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'eyJ...' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(process.env.SUPABASE_SERVICE_ROLE_KEY.length - 4) : 'Not set',
      SNAPTABLE_API_URL: process.env.SNAPTABLE_API_URL?.substring(0, 40) + '...',
    }
  });
}
