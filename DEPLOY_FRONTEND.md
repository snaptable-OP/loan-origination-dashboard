# Deploy Frontend Dashboard to Vercel

## Current Status

✅ **API/Webhook**: Already deployed on Vercel  
❌ **Frontend Dashboard**: Not yet deployed

## Quick Deploy Steps

### Option 1: Auto-Deploy via GitHub (Recommended)

Since your code is already on GitHub, Vercel will auto-deploy when you push:

1. **Add environment variables in Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Select your project: `loan-origination-dashboard`
   - Go to **Settings** → **Environment Variables**
   - Add these **NEW** variables (for frontend):
     - `VITE_SUPABASE_URL` = `https://zzodexvvxyyndilxtmsm.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ`
   - Make sure to select **Production**, **Preview**, and **Development** for each

2. **Push the new frontend code:**
   ```bash
   git add .
   git commit -m "Add project financing dashboard frontend"
   git push
   ```

3. **Vercel will automatically:**
   - Detect the `vercel.json` configuration
   - Build the frontend with `npm run build`
   - Deploy both API functions and frontend
   - Your dashboard will be at: `https://loan-origination-dashboard.vercel.app`

### Option 2: Manual Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Add environment variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   # Paste: https://zzodexvvxyyndilxtmsm.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY
   # Paste: sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

## After Deployment

Your dashboard will be available at:
```
https://loan-origination-dashboard.vercel.app
```

**Note**: The same URL serves both:
- Frontend dashboard (root path `/`)
- API endpoints (`/api/*`)

## Test Locally First

Before deploying, test locally:

1. **Create `.env` file:**
   ```env
   VITE_SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
   ```

2. **Run dev server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   ```
   http://localhost:5173
   ```

4. **Navigate to Project Financing section** in the sidebar to see the dashboard

## Troubleshooting

### Frontend not loading
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- Check browser console for errors
- Verify Supabase connection

### API endpoints not working
- Check that server-side env vars are set (SUPABASE_URL, etc.)
- Verify API functions are deployed in Vercel

### Build errors
- Make sure all dependencies are in `package.json`
- Check that `vercel.json` is configured correctly
