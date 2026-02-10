# How to Test Webhook with curl

## Step 1: Open Terminal

On Mac:
- Press `Cmd + Space` to open Spotlight
- Type "Terminal" and press Enter
- Or go to Applications → Utilities → Terminal

## Step 2: Get Your Vercel URL

1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. On the Overview page, you'll see your deployment URL
4. It will look like: `https://loan-origination-dashboard.vercel.app`
5. Copy this URL

## Step 3: Run curl Command

In Terminal, paste this command (replace `your-project-name.vercel.app` with your actual URL):

```bash
curl -X POST https://your-project-name.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000,
    "as_if_complete_valuation_of_project": 4869565,
    "drawdown_schedule": [
      {
        "construction_milestone": "Foundations and floor structure",
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

Press Enter to run it.

## Step 4: Check Response

You should see a JSON response like:
```json
{
  "success": true,
  "message": "Project financing data received, transformed, and saved successfully",
  ...
}
```

If you see an error, copy the error message.

## Step 5: Check Vercel Logs

After running curl:
1. Go to Vercel Dashboard → Your Project → "Logs" tab
2. You should see new log entries with "=== WEBHOOK RECEIVED ==="

## Step 6: Check Supabase

Run this in Supabase SQL Editor:
```sql
SELECT * FROM project_financing_data 
ORDER BY created_at DESC 
LIMIT 1;
```
