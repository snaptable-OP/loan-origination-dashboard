# Troubleshooting Blank Page on Vercel

## Quick Checks

### 1. Check Vercel Build Logs
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Go to **Deployments** tab
4. Click on the **latest deployment**
5. Check **Build Logs** tab
6. Look for:
   - ✅ "Build successful" or "Build completed"
   - ❌ Any errors (red text)
   - ❌ "Build failed" messages

### 2. Check Browser Console
1. Open: https://loan-origination-dashboard.vercel.app
2. Press `F12` or `Cmd+Option+I` (Mac) to open Developer Tools
3. Go to **Console** tab
4. Look for:
   - Red error messages
   - "Failed to fetch" errors
   - "Module not found" errors
   - Any JavaScript errors

### 3. Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for:
   - Failed requests (red)
   - 404 errors
   - CORS errors

## Common Issues & Fixes

### Issue 1: Build Failed
**Symptoms**: Build logs show errors

**Fix**:
- Check for missing dependencies in `package.json`
- Verify all files are committed to GitHub
- Check for syntax errors in code

### Issue 2: Missing Environment Variables
**Symptoms**: Console shows "Supabase client not initialized" or connection errors

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = `https://zzodexvvxyyndilxtmsm.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ`
3. Select all environments (Production, Preview, Development)
4. Redeploy

### Issue 3: JavaScript Error
**Symptoms**: Console shows React/JavaScript errors

**Fix**:
- Check the error message
- Common issues:
  - Import errors (wrong paths)
  - Missing components
  - Undefined variables

### Issue 4: Vercel Configuration Issue
**Symptoms**: Page loads but shows 404 or wrong content

**Fix**:
- Verify `vercel.json` exists and is correct
- Check that `outputDirectory` is set to `dist`
- Verify `buildCommand` is `npm run build`

## Quick Test

### Test if API is working:
```bash
curl https://loan-origination-dashboard.vercel.app/api/health
```

If this works, the deployment is fine, issue is with frontend.

### Test if frontend files exist:
Check if these files are in the build:
- `index.html`
- `assets/index-*.js`
- `assets/index-*.css`

## Debug Steps

1. **Check Vercel Deployment Status**
   - Is it "Ready" (green) or "Building" or "Error"?

2. **Check Build Output**
   - In Vercel → Deployments → Latest → Build Logs
   - Look for "Build Output" section
   - Should see "dist" folder with files

3. **Check Browser Console**
   - Open DevTools → Console
   - Look for any errors
   - Share the error message

4. **Check Network Requests**
   - Open DevTools → Network
   - Refresh page
   - Check if `index.html` loads (should be 200)
   - Check if JS/CSS files load

## What to Share

If still having issues, share:
1. **Vercel Build Logs** - Any errors?
2. **Browser Console** - Any JavaScript errors?
3. **Network Tab** - What requests are failing?
4. **Deployment Status** - Is it "Ready" or "Error"?
