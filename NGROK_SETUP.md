# ngrok Setup Guide

## What is ngrok?

ngrok creates a secure tunnel from the internet to your local machine. It gives you a public URL (like `https://abc123.ngrok.io`) that forwards all traffic to your local server (like `http://localhost:3000`).

This allows 3rd party apps to send webhooks to your local development server.

## How It Works

```
3rd Party App
    ↓
Sends to: https://abc123.ngrok.io/api/webhook
    ↓
ngrok Tunnel (forwards request)
    ↓
Your Local Server: http://localhost:3000/api/webhook
    ↓
Processes and saves to Supabase
```

## Installation

### Option 1: Using Homebrew (macOS)
```bash
brew install ngrok/ngrok/ngrok
```

### Option 2: Direct Download
1. Go to https://ngrok.com/download
2. Download for your OS (macOS, Windows, Linux)
3. Extract and add to your PATH, or use directly

### Option 3: Using npm (if you prefer)
```bash
npm install -g ngrok
```

## Setup Steps

### Step 1: Sign up for ngrok (Free)
1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Get your authtoken from the dashboard

### Step 2: Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Local Server
```bash
npm run server
```

You should see:
```
Server running on http://localhost:3000
```

### Step 4: Start ngrok (in a new terminal)
```bash
ngrok http 3000
```

You'll see output like:
```
ngrok

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Step 5: Copy the Forwarding URL
The important part is:
```
Forwarding    https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

Your webhook URL for the 3rd party app is:
```
https://abc123-def456.ngrok-free.app/api/webhook/project-financing
```

## Important Notes

### 1. ngrok URLs Change
- **Free accounts**: URL changes every time you restart ngrok
- **Paid accounts**: Can get static URLs that don't change
- **Solution**: Update the URL in your 3rd party app each time you restart ngrok

### 2. ngrok Web Interface
When ngrok is running, you can visit:
```
http://127.0.0.1:4040
```

This shows:
- All incoming requests
- Request/response details
- Replay requests for testing

### 3. Keep Both Running
You need TWO terminals:
- **Terminal 1**: `npm run server` (your Node.js server)
- **Terminal 2**: `ngrok http 3000` (the tunnel)

If you close either one, the webhook won't work.

## Complete Example

### Terminal 1 (Server):
```bash
cd /Users/annieliang/loan-origination-dashboard
npm run server
```

Output:
```
Server running on http://localhost:3000
Webhook endpoint: http://localhost:3000/api/webhook
```

### Terminal 2 (ngrok):
```bash
ngrok http 3000
```

Output:
```
Forwarding    https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

### 3rd Party App Configuration:
```
Webhook URL: https://abc123-def456.ngrok-free.app/api/webhook/project-financing
```

## Testing the Setup

### 1. Test ngrok is forwarding correctly:
```bash
curl https://abc123-def456.ngrok-free.app/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Test webhook endpoint:
```bash
curl https://abc123-def456.ngrok-free.app/api/webhook/test
```

### 3. Test actual webhook:
```bash
curl -X POST https://abc123-def456.ngrok-free.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692,
    "as_is_valuation_of_project": 1520000
  }'
```

## Troubleshooting

### Issue: "ngrok: command not found"
**Solution:** Make sure ngrok is installed and in your PATH

### Issue: "ERR_NGROK_3200" or authentication error
**Solution:** Run `ngrok config add-authtoken YOUR_TOKEN` again

### Issue: "tunnel not found" or connection refused
**Solution:** 
- Make sure your local server is running on port 3000
- Make sure ngrok is pointing to the correct port: `ngrok http 3000`

### Issue: URL keeps changing
**Solution:** 
- This is normal for free accounts
- Update the URL in your 3rd party app each time
- Or upgrade to a paid plan for static URLs

### Issue: "Too many connections" or rate limits
**Solution:** 
- Free ngrok has rate limits
- Consider upgrading or using a different tunneling service

## Alternative: Keep ngrok URL Stable

### Option 1: Use ngrok config file
Create `~/.ngrok2/ngrok.yml`:
```yaml
tunnels:
  webhook:
    addr: 3000
    proto: http
```

Then run:
```bash
ngrok start webhook
```

### Option 2: Use a paid ngrok plan
Paid plans allow you to reserve a static domain.

## Quick Reference

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Authenticate
ngrok config add-authtoken YOUR_TOKEN

# Start tunnel
ngrok http 3000

# View requests (in browser)
open http://127.0.0.1:4040
```

## Next Steps

1. Install ngrok
2. Start your server: `npm run server`
3. Start ngrok: `ngrok http 3000`
4. Copy the forwarding URL
5. Give the 3rd party app: `https://your-ngrok-url.ngrok-free.app/api/webhook/project-financing`
6. Test by sending data from the 3rd party app
7. Check your server logs and Supabase to verify data was received
