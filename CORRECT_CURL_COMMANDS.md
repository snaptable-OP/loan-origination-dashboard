# Correct curl Commands for Testing

## Test Health Endpoint (GET - should work)

```bash
curl https://your-project-name.vercel.app/api/health
```

This should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Test Webhook Endpoint (POST - required)

**Important:** Webhook endpoints require POST method, not GET!

### Option 1: Simple test
```bash
curl -X POST https://your-project-name.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{"loan_to_value_ratio": 0.603}'
```

### Option 2: Full test with all fields
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

### Option 3: Using main webhook endpoint (auto-detects)
```bash
curl -X POST https://your-project-name.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'
```

## Common Mistakes

❌ **Wrong:** Missing `-X POST`
```bash
curl https://your-project-name.vercel.app/api/webhook/project-financing
```
This sends a GET request, which will return "Method not allowed"

✅ **Correct:** Include `-X POST`
```bash
curl -X POST https://your-project-name.vercel.app/api/webhook/project-financing
```

## Expected Responses

### Success Response:
```json
{
  "success": true,
  "message": "Project financing data received, transformed, and saved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "project_financing_data": {
    "id": "uuid-here",
    ...
  },
  "snaptable_transformed": true
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

## Testing Steps

1. **First test health endpoint (GET):**
   ```bash
   curl https://your-project-name.vercel.app/api/health
   ```
   Should work immediately

2. **Then test webhook (POST):**
   ```bash
   curl -X POST https://your-project-name.vercel.app/api/webhook/project-financing \
     -H "Content-Type: application/json" \
     -d '{"loan_to_value_ratio": 0.603}'
   ```

3. **Check the response** - you should see JSON output

4. **Check Vercel logs** for detailed information

5. **Check Supabase** to verify data was saved
