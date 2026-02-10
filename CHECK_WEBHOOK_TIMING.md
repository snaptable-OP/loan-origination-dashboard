# How to Check Webhook Timing (12:39pm Export)

## Step 1: Check Vercel Logs for Performance Metrics

### Option A: Real-time Logs (Best for Recent Webhooks)
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Click **"Logs"** tab (top navigation bar)
4. Filter by time: Look for logs around **12:39pm**
5. Search for: `⏱️` or `TOTAL PROCESSING TIME`

### Option B: Function-Specific Logs
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on the **latest deployment**
5. Scroll to **Functions** section
6. Click on `/api/webhook/project-financing`
7. Click **"Logs"** tab
8. Look for entries around **12:39pm**

## What You Should See in Logs

You should see timing breakdown like this:
```
=== WEBHOOK RECEIVED ===
Timestamp: 2026-02-10T12:39:XX.XXXZ
⏱️  Time to receive: 5ms
⏱️  Snaptable transformation: 800ms
⏱️  Supabase save: 429ms
⏱️  TOTAL PROCESSING TIME: 1234ms
   - Receive: 5ms
   - Snaptable: 800ms
   - Supabase: 429ms
```

## Step 2: Check API Response (if you have it)

If you captured the webhook response, it should include:
```json
{
  "success": true,
  "performance": {
    "total_time_ms": 1234,
    "receive_time_ms": 5,
    "snaptable_time_ms": 800,
    "supabase_time_ms": 429
  }
}
```

## Step 3: Verify Data Was Saved

### Check Supabase for the 12:39pm record:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor** → `project_financing_data`
4. Look for a record with `created_at` around **12:39pm**
5. Or run this SQL query:

```sql
SELECT 
  id,
  created_at,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project
FROM project_financing_data
WHERE created_at >= '2026-02-10 12:39:00'
  AND created_at <= '2026-02-10 12:40:00'
ORDER BY created_at DESC;
```

## Step 4: Detailed Timing Breakdown

The logs will show:
- **Time to receive**: How long it took to receive the webhook request
- **Snaptable transformation**: Time for the Snaptable API call (network + processing)
- **Supabase save**: Time to insert into main table + related tables
- **Total time**: End-to-end processing time

## If You Don't See Logs

1. **Check the timezone**: Vercel logs are in UTC, your 12:39pm might be different in UTC
2. **Check deployment**: Make sure the latest code with timing logs is deployed
3. **Check webhook URL**: Verify the 3rd party app is using the correct URL
4. **Check function invocations**: Look in Vercel Analytics → Functions

## Quick Test

To generate fresh logs with timing, send a test webhook:

```bash
curl -X POST https://your-project.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692
  }'
```

Then immediately check Vercel logs - you'll see the timing breakdown.
