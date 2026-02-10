# Webhook URL Guide - Troubleshooting

## Correct Webhook URLs

### For Local Development (Testing):
```
http://localhost:3000/api/webhook
```
or
```
http://localhost:3000/api/webhook/project-financing
```

### For Production/3rd Party App:
```
https://your-deployed-domain.com/api/webhook
```
or
```
https://your-deployed-domain.com/api/webhook/project-financing
```

### If Using ngrok (for testing):
```
https://your-ngrok-url.ngrok.io/api/webhook
```
or
```
https://your-ngrok-url.ngrok.io/api/webhook/project-financing
```

## Verify Your Server is Running

### Step 1: Check if Server is Running
```bash
npm run server
```

You should see:
```
Server running on http://localhost:3000
Webhook endpoint: http://localhost:3000/api/webhook
```

### Step 2: Test the Endpoint is Accessible

**Option A: Test with curl (local):**
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

**Option B: Test webhook endpoint:**
```bash
curl http://localhost:3000/api/webhook/test
```

Should return endpoint information.

**Option C: Test with a real webhook call:**
```bash
curl -X POST http://localhost:3000/api/webhook/project-financing \
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

## Common Issues

### Issue 1: "Connection Refused" or "Cannot Connect"
**Problem:** Server is not running or wrong URL

**Solution:**
1. Make sure server is running: `npm run server`
2. Check the PORT in your `.env` file (default is 3000)
3. Verify the URL matches: `http://localhost:3000` (not 3001, 8080, etc.)

### Issue 2: "404 Not Found"
**Problem:** Wrong endpoint path

**Solution:**
- Use exactly: `/api/webhook` or `/api/webhook/project-financing`
- Don't add trailing slashes
- Don't use `/webhook` (missing `/api`)

### Issue 3: "localhost" Not Accessible from 3rd Party
**Problem:** 3rd party app can't reach localhost

**Solution:**
1. **Use ngrok** to expose localhost:
   ```bash
   ngrok http 3000
   ```
   Then use the ngrok URL (e.g., `https://abc123.ngrok.io/api/webhook/project-financing`)

2. **Deploy your server** to a hosting service (Render, Railway, Heroku, etc.)

### Issue 4: "CORS Error"
**Problem:** CORS middleware might need configuration

**Solution:** The server already has CORS enabled, but if issues persist, check the CORS configuration in `server.js`

## Verify 3rd Party App Configuration

Make sure the 3rd party app is configured with:

1. **Correct URL:**
   - For local testing with ngrok: `https://your-ngrok-url.ngrok.io/api/webhook/project-financing`
   - For production: `https://your-domain.com/api/webhook/project-financing`

2. **HTTP Method:** POST (not GET)

3. **Headers:**
   - `Content-Type: application/json`

4. **Request Body:** Valid JSON matching your schema

## Debugging Steps

### 1. Check Server Logs
When you run `npm run server`, you should see logs for every request:
```
2024-01-15T10:30:00.000Z - POST /api/webhook
Webhook received at: 2024-01-15T10:30:00.000Z
```

### 2. Check Network Tab
If testing from browser, check browser DevTools → Network tab to see if request is being sent

### 3. Test Each Component
- Test health endpoint: `GET /health`
- Test webhook test endpoint: `GET /api/webhook/test`
- Test actual webhook: `POST /api/webhook/project-financing`

### 4. Verify Environment Variables
Check your `.env` file has:
```env
PORT=3000
SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

## Quick Test Checklist

- [ ] Server is running (`npm run server`)
- [ ] Health endpoint works (`curl http://localhost:3000/health`)
- [ ] Webhook test endpoint works (`curl http://localhost:3000/api/webhook/test`)
- [ ] Using correct URL format: `/api/webhook/project-financing`
- [ ] Using POST method (not GET)
- [ ] Sending JSON in request body
- [ ] If using 3rd party, URL is publicly accessible (ngrok or deployed)
- [ ] Check server console for incoming requests

## Example: Complete Test Flow

```bash
# 1. Start server
npm run server

# 2. In another terminal, test health
curl http://localhost:3000/health

# 3. Test webhook endpoint
curl -X POST http://localhost:3000/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{"loan_to_value_ratio": 0.603, "loan_to_cost_ratio": 0.692}'

# 4. Check Supabase to see if data was saved
```

## Still Not Working?

If data still doesn't arrive:

1. **Check server console** - Are you seeing any requests logged?
2. **Check 3rd party app logs** - Is it successfully sending the request?
3. **Verify URL in 3rd party app** - Copy/paste the exact URL
4. **Test with curl first** - Make sure the endpoint works locally
5. **Check firewall/network** - Make sure port 3000 is accessible
