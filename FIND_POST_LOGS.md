# How to Find POST Request Logs in Vercel

## Step 1: Test the Webhook to Generate Logs

Run this command in your terminal (replace with your actual Vercel URL):

```bash
curl -X POST https://loan-origination-dashboard.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{"loan_to_value_ratio": 0.603, "loan_to_cost_ratio": 0.692}'
```

**Do this NOW** - then immediately check Vercel logs.

## Step 2: Where to Look for Logs

### Option A: Real-time Logs (BEST for testing)
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Click **"Logs"** tab (top navigation bar - NOT in deployments)
4. You should see logs appear in real-time
5. Look for:
   - `POST /api/webhook/project-financing`
   - `=== WEBHOOK RECEIVED ===`
   - Timing metrics with `⏱️`

### Option B: Function-Specific Logs
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on the **latest deployment** (the one that just completed)
5. Scroll down to **"Functions"** section
6. Look for `/api/webhook/project-financing`
7. Click on it
8. Click **"Logs"** tab
9. You should see function invocations

### Option C: Check Function Invocations
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Analytics"** or **"Functions"** tab
4. Look for recent function invocations
5. Click on a recent one to see logs

## Step 3: What You Should See

If the webhook is working, you'll see:
```
=== WEBHOOK RECEIVED ===
Timestamp: 2026-02-10T...
⏱️  Time to receive: Xms
⏱️  Snaptable transformation: Xms
⏱️  Supabase save: Xms
⏱️  TOTAL PROCESSING TIME: Xms
```

## Step 4: If You Still Don't See Logs

1. **Check the URL** - Make sure you're using the correct Vercel project URL
2. **Check deployment status** - Make sure the latest deployment is "Ready" (green checkmark)
3. **Check function exists** - In Deployments → Functions, verify `/api/webhook/project-financing` is listed
4. **Try the health endpoint first**:
   ```bash
   curl https://loan-origination-dashboard.vercel.app/api/health
   ```
   If this works, basic routing is fine.

## Step 5: Check for Errors

If you see errors instead of logs:
- Look for `FUNCTION_INVOCATION_FAILED`
- Check the error message
- Share the error with me
