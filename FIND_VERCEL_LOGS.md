# How to Find Vercel Logs

## Method 1: Real-time Function Logs

1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Click **"Deployments"** tab
4. Click on the **latest deployment** (the most recent one)
5. You'll see a list of functions/routes
6. Look for: `/api/webhook/project-financing` or `/api/webhook`
7. Click on that function
8. Click **"Logs"** tab
9. You should see real-time logs

## Method 2: Real-time Logs (Better for Live Testing)

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Logs"** tab (in the top navigation, not in deployments)
4. This shows real-time logs from all functions
5. Send your webhook again and watch for new log entries

## Method 3: Check Function Invocations

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Analytics"** or **"Functions"** tab
4. Look for function invocations
5. Click on a recent invocation to see logs

## What to Look For

When you send a webhook, you should see logs like:
- `Project financing webhook received at: [timestamp]`
- `Received data: [JSON]`
- `Sending data to Snaptable API...`
- `Snaptable API response received: [data]`
- `Application saved successfully`

## If No Logs Appear

This could mean:
1. **Webhook wasn't called** - Check the URL in your 3rd party app
2. **Wrong endpoint** - Verify the path is correct
3. **CORS issue** - Check browser console if testing from browser
4. **Function not deployed** - Check if deployment succeeded

## Test the Webhook Directly

Use curl to test and see logs in real-time:

```bash
curl -X POST https://your-project.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'
```

Then immediately check Vercel logs - you should see the request appear.
