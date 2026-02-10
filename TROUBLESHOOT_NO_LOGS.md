# Troubleshooting: No POST Logs Appearing

If you sent a webhook but don't see POST logs in Vercel, follow these steps:

## Step 1: Verify the Webhook Was Actually Sent

### Check Your 3rd Party App
1. Does your 3rd party app show that the webhook was sent?
2. Does it show a success/failure status?
3. Does it show the response code (200, 404, 500, etc.)?

### Common Issues:
- ❌ Webhook might not have been triggered
- ❌ Webhook URL might be incorrect
- ❌ Network/firewall blocking the request
- ❌ 3rd party app might be retrying (check for retry logs)

## Step 2: Verify the Webhook URL

Make sure your 3rd party app is using the **exact** URL:
```
https://loan-origination-dashboard.vercel.app/api/webhook/project-financing
```

**Common mistakes:**
- Missing `/api` prefix
- Wrong path (`/webhook` instead of `/api/webhook/project-financing`)
- HTTP instead of HTTPS
- Trailing slash (`/api/webhook/project-financing/` - remove the trailing slash)
- Wrong project name in URL

## Step 3: Check All Log Locations in Vercel

### Location 1: Real-time Logs (Most Important)
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Click **"Logs"** tab (top navigation bar - NOT in deployments)
4. This shows ALL requests in real-time
5. Look for ANY POST requests (not just your webhook)

### Location 2: Function Invocations
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on **latest deployment**
5. Scroll to **"Functions"** section
6. Look for `/api/webhook/project-financing`
7. Check if there are any invocations listed
8. Click on it to see details

### Location 3: Analytics/Functions Tab
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Analytics"** or **"Functions"** tab
4. Look for function invocations
5. Check if `/api/webhook/project-financing` appears

## Step 4: Test the Endpoint Directly

Run this command to verify the endpoint is working:

```bash
curl -X POST https://loan-origination-dashboard.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -v \
  -d '{"loan_to_value_ratio": 0.603, "loan_to_cost_ratio": 0.692}'
```

**If this works:**
- ✅ Endpoint is working
- ✅ The issue is with your 3rd party app configuration
- Check the webhook URL in your 3rd party app

**If this fails:**
- ❌ There's an issue with the deployment
- Check the error message
- Verify environment variables are set

## Step 5: Check for Errors in 3rd Party App

1. Check your 3rd party app's webhook logs/status
2. Look for error messages like:
   - Connection timeout
   - 404 Not Found
   - 500 Server Error
   - SSL/TLS errors

## Step 6: Verify Time Zone

Vercel logs are in **UTC time**. Your 1:37pm might be:
- If you're in EST (UTC-5): 1:37pm EST = 6:37pm UTC
- If you're in PST (UTC-8): 1:37pm PST = 9:37pm UTC
- If you're in GMT (UTC+0): 1:37pm GMT = 1:37pm UTC

Check logs around the UTC equivalent time.

## Step 7: Check Supabase Directly

Even if logs don't show, check if data was saved:

```sql
SELECT 
  id,
  created_at,
  loan_to_value_ratio,
  loan_to_cost_ratio
FROM project_financing_data
ORDER BY created_at DESC
LIMIT 5;
```

If data exists, the webhook worked but logs might not be showing.

## Step 8: Enable More Verbose Logging

If you still can't see logs, the webhook might be failing before it reaches the function. Check:
1. Vercel Dashboard → Your Project → Settings → Logs
2. Make sure logging is enabled
3. Check if there are any filters applied

## What to Share

If you still can't find the logs, share:
1. **What your 3rd party app shows** - Does it say the webhook was sent? What status code?
2. **The exact webhook URL** you're using in the 3rd party app
3. **What you see in Vercel** - Any errors? Any logs at all?
4. **Result of the curl test** - Does the direct test work?
