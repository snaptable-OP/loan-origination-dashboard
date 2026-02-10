# Add Environment Variables via Vercel CLI

If you prefer using the command line:

## Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

## Login
```bash
vercel login
```

## Add Environment Variables

Run these commands one by one (you'll be prompted for values):

```bash
# Add SUPABASE_URL
vercel env add SUPABASE_URL

# Add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Add SUPABASE_ANON_KEY
vercel env add SUPABASE_ANON_KEY

# Add SNAPTABLE_API_URL
vercel env add SNAPTABLE_API_URL

# Add SNAPTABLE_API_TOKEN
vercel env add SNAPTABLE_API_TOKEN
```

For each command:
- When asked for value, paste the value
- When asked for environment, type: `production,preview,development` (or just press enter for all)

## Redeploy
```bash
vercel --prod
```
