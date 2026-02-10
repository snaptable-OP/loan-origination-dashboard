# Debug Webhook - Step by Step

## Step 1: Find Vercel Logs

### Option A: Real-time Logs (Best)
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Click **"Logs"** tab (top navigation bar)
4. This shows ALL logs in real-time
5. Send webhook → Watch for new entries

### Option B: Function Logs
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on **latest deployment**
5. Scroll down to see function invocations
6. Click on `/api/webhook/project-financing`
7. Click **"Logs"** tab

## Step 2: Test Webhook Directly

### Test with curl (to generate logs):

```bash
# Replace with your actual Vercel URL
curl -X POST https://your-project.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -v \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000,
    "as_if_complete_valuation_of_project": 4869565,
    "drawdown_schedule": [
      {
        "construction_milestone": "Test milestone",
        "drawdown_sum_for_milestone": 0.1
      }
    ],
    "expected_presales": 0,
    "existing_permits_and_approvals": [],
    "contractual_term_and_risk_assessment": [],
    "contingency_sum": {
      "contingency_sum": 45770,
      "percentage_of_project_cost": 2
    }
  }'
```

The `-v` flag shows verbose output so you can see the response.

## Step 3: Check What Happened

### If you see logs:
- ✅ Webhook is working
- Check for errors in the logs
- Verify data was saved to Supabase

### If you DON'T see logs:
- ❌ Webhook might not be getting called
- Check the URL in your 3rd party app
- Verify the endpoint path is correct

## Step 4: Verify Webhook URL

Make sure your 3rd party app is using:
```
https://your-project-name.vercel.app/api/webhook/project-financing
```

Common mistakes:
- Missing `/api` prefix
- Wrong path (`/webhook` instead of `/api/webhook/project-financing`)
- HTTP instead of HTTPS
- Trailing slash issues

## Step 5: Check Response

When you send the webhook, you should get a response:

**Success:**
```json
{
  "success": true,
  "message": "Project financing data received, transformed, and saved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "project_financing_data": { ... },
  "snaptable_transformed": true
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

## Step 6: Check Supabase

Even if logs aren't showing, check Supabase:

```sql
SELECT * FROM project_financing_data 
ORDER BY created_at DESC 
LIMIT 5;
```

If data appears here, the webhook IS working (just logs might not be showing).

## Quick Test Checklist

- [ ] Test webhook with curl (see response)
- [ ] Check Vercel Logs tab (real-time)
- [ ] Check Supabase for new data
- [ ] Verify webhook URL in 3rd party app
- [ ] Check 3rd party app logs/response
