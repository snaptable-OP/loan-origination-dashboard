# Troubleshooting ROUTER_EXTERNAL_TARGET_ERROR

## What This Error Means

`ROUTER_EXTERNAL_TARGET_ERROR` means Vercel can't find or route to your serverless function.

## Step 1: Test Health Endpoint First

Before testing the webhook, test the simpler health endpoint:

```bash
curl https://your-project-name.vercel.app/api/health
```

**If this works:** Basic routing is fine, issue is with webhook endpoint
**If this fails:** There's a broader routing/configuration issue

## Step 2: Check Function Files Exist

Make sure these files exist in your repo:
- ✅ `api/health.js`
- ✅ `api/webhook.js`
- ✅ `api/webhook/project-financing.js`

## Step 3: Verify Function Export Format

Each function should have:
```javascript
export default async function handler(req, res) {
  // function code
}
```

## Step 4: Check Vercel Deployment

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check "Functions" section
4. You should see:
   - `/api/health`
   - `/api/webhook`
   - `/api/webhook/project-financing`

If functions don't appear, Vercel isn't detecting them.

## Step 5: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check "Build Logs" tab
4. Look for errors about:
   - Missing files
   - Import errors
   - Module not found

## Common Fixes

### Fix 1: Ensure Files Are Committed
```bash
git add api/
git commit -m "Add API functions"
git push
```

### Fix 2: Check File Permissions
Files should be readable (not executable-only)

### Fix 3: Verify Import Paths
Check that imports in `api/shared.js` and function files use correct relative paths:
- `../lib/supabase.js` ✅
- `./shared.js` ✅
- Not absolute paths ❌

### Fix 4: Test Locally First
If you have Vercel CLI:
```bash
vercel dev
```
Then test: `curl http://localhost:3000/api/health`

## Alternative: Use Main Webhook Endpoint

If nested route doesn't work, try the main endpoint:

```bash
curl -X POST https://your-project-name.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'
```

This endpoint auto-detects project financing data and should work.

## Next Steps

1. Test `/api/health` first
2. Check Vercel deployment logs
3. Verify all files are in GitHub
4. Try main webhook endpoint if nested one fails
5. Share what you see in Vercel function list
