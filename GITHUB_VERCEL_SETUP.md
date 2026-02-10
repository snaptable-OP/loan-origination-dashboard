# Complete Guide: GitHub → Vercel Deployment

## Part 1: Push Code to GitHub

### Step 1: Check if Git is Already Initialized

```bash
cd /Users/annieliang/loan-origination-dashboard
ls -la | grep .git
```

If you see `.git` folder, skip to Step 3. If not, continue to Step 2.

### Step 2: Initialize Git Repository

```bash
git init
```

### Step 3: Create .gitignore (if needed)

Make sure `.gitignore` exists and includes:
```
node_modules/
.env
dist/
*.log
.DS_Store
```

### Step 4: Stage All Files

```bash
git add .
```

### Step 5: Create Initial Commit

```bash
git commit -m "Initial commit: Loan origination dashboard with webhook API"
```

### Step 6: Create GitHub Repository

**Option A: Via GitHub Website (Easier)**
1. Go to https://github.com
2. Click the **"+"** icon in top right → **"New repository"**
3. Repository name: `loan-origination-dashboard` (or your preferred name)
4. Description: "Loan origination dashboard with webhook API"
5. Choose **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have code)
7. Click **"Create repository"**

**Option B: Via GitHub CLI (if installed)**
```bash
gh repo create loan-origination-dashboard --public --source=. --remote=origin --push
```

### Step 7: Add GitHub Remote

After creating the repo, GitHub will show you commands. Use the one that says "push an existing repository":

```bash
git remote add origin https://github.com/YOUR_USERNAME/loan-origination-dashboard.git
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 8: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

You may be prompted to login to GitHub. Follow the authentication steps.

### Step 9: Verify on GitHub

Go to your repository URL:
```
https://github.com/YOUR_USERNAME/loan-origination-dashboard
```

You should see all your files there!

---

## Part 2: Import to Vercel

### Step 1: Go to Vercel

1. Visit https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Sign up/Login with GitHub (recommended - easier integration)

### Step 2: Create New Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find `loan-origination-dashboard` and click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect settings, but verify:

- **Framework Preset:** `Other` (or leave as detected)
- **Root Directory:** `.` (current directory)
- **Build Command:** (leave empty - we're using serverless functions)
- **Output Directory:** (leave empty)
- **Install Command:** `npm install` (should be auto-filled)

Click **"Deploy"** (we'll add environment variables after)

### Step 4: Wait for Initial Deployment

- Vercel will start deploying
- This may take 1-2 minutes
- You'll see build logs in real-time
- Wait for "Ready" status

### Step 5: Add Environment Variables

**Important:** Do this BEFORE testing the webhook!

1. Go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left sidebar
4. Add each variable one by one:

#### Add SUPABASE_URL:
- **Key:** `SUPABASE_URL`
- **Value:** `https://zzodexvvxyyndilxtmsm.supabase.co`
- **Environment:** Select all (Production, Preview, Development)
- Click **"Save"**

#### Add SUPABASE_SERVICE_ROLE_KEY:
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (Your service role key from Supabase Dashboard → Settings → API)
- **Environment:** Select all
- Click **"Save"**

#### Add SUPABASE_ANON_KEY:
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ`
- **Environment:** Select all
- Click **"Save"**

#### Add SNAPTABLE_API_URL:
- **Key:** `SNAPTABLE_API_URL`
- **Value:** `https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f`
- **Environment:** Select all
- Click **"Save"**

#### Add SNAPTABLE_API_TOKEN:
- **Key:** `SNAPTABLE_API_TOKEN`
- **Value:** `st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj`
- **Environment:** Select all
- Click **"Save"**

### Step 6: Redeploy with Environment Variables

After adding all environment variables:

1. Go to **"Deployments"** tab
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Confirm redeployment
5. Wait for deployment to complete

### Step 7: Get Your Webhook URL

1. Go to **"Overview"** tab
2. You'll see your deployment URL:
   ```
   https://loan-origination-dashboard.vercel.app
   ```
   (Your actual URL may be different)

2. Your webhook endpoints are:
   - **Main:** `https://your-project.vercel.app/api/webhook`
   - **Project Financing:** `https://your-project.vercel.app/api/webhook/project-financing`
   - **Health Check:** `https://your-project.vercel.app/api/health`
   - **Test:** `https://your-project.vercel.app/api/webhook/test`

---

## Part 3: Test Your Deployment

### Test Health Endpoint

```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

### Test Webhook Endpoint

```bash
curl https://your-project.vercel.app/api/webhook/test
```

Should return endpoint information.

### Test Actual Webhook

```bash
curl -X POST https://your-project.vercel.app/api/webhook/project-financing \
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

---

## Part 4: Update 3rd Party App

1. Copy your webhook URL:
   ```
   https://your-project.vercel.app/api/webhook/project-financing
   ```

2. Go to your 3rd party app settings
3. Update the webhook URL
4. Save and test!

---

## Troubleshooting

### Issue: "Repository not found" when pushing
**Solution:** 
- Check your GitHub username in the remote URL
- Make sure the repository exists on GitHub
- Verify you're logged into GitHub

### Issue: "Permission denied" when pushing
**Solution:**
- Use GitHub Personal Access Token instead of password
- Or use SSH keys: `git remote set-url origin git@github.com:USERNAME/REPO.git`

### Issue: Vercel can't find the repository
**Solution:**
- Make sure you're logged into Vercel with the same GitHub account
- Check repository visibility (make sure it's accessible)
- Try disconnecting and reconnecting GitHub

### Issue: Environment variables not working
**Solution:**
- Make sure you redeployed after adding variables
- Check variable names match exactly (case-sensitive)
- Verify values are correct (no extra spaces)

### Issue: "Function not found" errors
**Solution:**
- Make sure `api/` folder exists with all function files
- Check `vercel.json` configuration
- Verify file paths are correct

---

## Quick Reference Commands

```bash
# Git commands
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main

# Update code later
git add .
git commit -m "Update description"
git push
```

---

## What Happens Next

✅ **Automatic Deployments:** Every time you push to GitHub, Vercel automatically redeploys!

✅ **Permanent URL:** Your webhook URL never changes

✅ **Free Forever:** Vercel free tier is generous for webhooks

✅ **HTTPS:** Automatic SSL certificate

✅ **Global CDN:** Fast response times worldwide

---

## Summary Checklist

- [ ] Initialize git repository
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Sign up/Login to Vercel
- [ ] Import GitHub repository to Vercel
- [ ] Add all environment variables
- [ ] Redeploy with environment variables
- [ ] Test webhook endpoints
- [ ] Update 3rd party app with new URL
- [ ] Verify data is being saved to Supabase

🎉 **You're done!** Your webhook is now live and production-ready!
