# Quick Deploy to Vercel - Step by Step

## 🚀 Fastest Way (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Answer the prompts:
- Set up and deploy? → **Yes**
- Link to existing project? → **No**
- Project name? → Press Enter (use default)
- Directory? → Press Enter (current directory)

### Step 4: Add Environment Variables
```bash
vercel env add SUPABASE_URL
# Paste: https://zzodexvvxyyndilxtmsm.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key from Supabase

vercel env add SUPABASE_ANON_KEY
# Paste: sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ

vercel env add SNAPTABLE_API_URL
# Paste: https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f

vercel env add SNAPTABLE_API_TOKEN
# Paste: st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

## ✅ Done!

Vercel will give you a URL like:
```
https://loan-origination-dashboard.vercel.app
```

**Your webhook URL for 3rd party app:**
```
https://loan-origination-dashboard.vercel.app/api/webhook/project-financing
```

## 🧪 Test It

```bash
# Test health
curl https://your-project.vercel.app/api/health

# Test webhook
curl -X POST https://your-project.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{"loan_to_value_ratio": 0.603}'
```

## 📝 What Was Created

- ✅ `api/` folder with serverless functions
- ✅ `vercel.json` configuration
- ✅ All webhook endpoints ready
- ✅ Environment variables setup guide

## 🎯 Next Steps

1. Deploy (follow steps above)
2. Copy the webhook URL
3. Give it to your 3rd party app
4. Test!
5. Done - URL never changes! 🎉
