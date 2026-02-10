# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press enter for default)
   - Directory? (Press enter for current directory)
   - Override settings? **No**

5. **Set Environment Variables:**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add SUPABASE_ANON_KEY
   vercel env add SNAPTABLE_API_URL
   vercel env add SNAPTABLE_API_TOKEN
   ```

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub (Easier)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project:**
   - Framework Preset: **Other**
   - Root Directory: `.` (current directory)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   - `SUPABASE_URL` = `https://zzodexvvxyyndilxtmsm.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
   - `SUPABASE_ANON_KEY` = `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ`
   - `SNAPTABLE_API_URL` = `https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f`
   - `SNAPTABLE_API_TOKEN` = `st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj`

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

## Your Webhook URLs

After deployment, Vercel will give you a URL like:
```
https://your-project-name.vercel.app
```

Your webhook endpoints will be:
- **Main webhook:** `https://your-project-name.vercel.app/api/webhook`
- **Project financing:** `https://your-project-name.vercel.app/api/webhook/project-financing`
- **Health check:** `https://your-project-name.vercel.app/api/health`
- **Test endpoint:** `https://your-project-name.vercel.app/api/webhook/test`

## Testing

### Test Health Endpoint:
```bash
curl https://your-project-name.vercel.app/api/health
```

### Test Webhook:
```bash
curl -X POST https://your-project-name.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'
```

## Environment Variables

Make sure to add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://zzodexvvxyyndilxtmsm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (Your service role key from Supabase) |
| `SUPABASE_ANON_KEY` | `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ` |
| `SNAPTABLE_API_URL` | `https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f` |
| `SNAPTABLE_API_TOKEN` | `st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj` |

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Your webhook URL becomes: `https://yourdomain.com/api/webhook/project-financing`

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Make sure all dependencies are in `package.json` and `node_modules` is committed (or use Vercel's automatic dependency installation)

### Issue: Environment variables not working
**Solution:** 
- Make sure variables are added in Vercel Dashboard
- Redeploy after adding variables: `vercel --prod`

### Issue: CORS errors
**Solution:** CORS is already configured in the API functions. If issues persist, check the `Access-Control-Allow-Origin` headers.

### Issue: Function timeout
**Solution:** Vercel free tier has 10s timeout. For longer operations, consider upgrading or optimizing the code.

## Benefits of Vercel

✅ **Free tier available**
✅ **Automatic HTTPS**
✅ **Global CDN**
✅ **Automatic deployments from GitHub**
✅ **Serverless functions (scales automatically)**
✅ **Permanent URL (never changes)**
✅ **Fast deployment**

## Next Steps

1. Deploy to Vercel
2. Get your permanent URL
3. Update 3rd party app with: `https://your-project.vercel.app/api/webhook/project-financing`
4. Test webhook
5. Done! No more URL changes needed.
