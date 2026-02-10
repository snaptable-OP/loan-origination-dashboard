# Quick Start: GitHub + Vercel (Copy-Paste Commands)

## 🚀 Step-by-Step Commands

### Part 1: Push to GitHub

```bash
# Navigate to project directory
cd /Users/annieliang/loan-origination-dashboard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Loan origination dashboard with webhook API"

# Create repository on GitHub first, then run:
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/loan-origination-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Before running the `git remote add` command:
1. Go to https://github.com/new
2. Create a new repository named `loan-origination-dashboard`
3. **Don't** initialize with README
4. Copy the repository URL and use it in the command above

---

### Part 2: Deploy to Vercel

#### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Sign up/Login with GitHub

#### Step 2: Import Repository
1. Click **"Add New..."** → **"Project"**
2. Find `loan-origination-dashboard` in the list
3. Click **"Import"**

#### Step 3: Configure (Leave defaults)
- Framework: `Other`
- Root Directory: `.`
- Build Command: (empty)
- Output Directory: (empty)
- Click **"Deploy"**

#### Step 4: Add Environment Variables
After deployment, go to **Settings** → **Environment Variables** and add:

```
SUPABASE_URL = https://zzodexvvxyyndilxtmsm.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (your service role key)
SUPABASE_ANON_KEY = sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
SNAPTABLE_API_URL = https://snaptable-platform.vercel.app/api/v1/compile/8b2813c7-696f-4ab2-849d-2e6f61bdd04f
SNAPTABLE_API_TOKEN = st_VgCeN1qdYKU79jQVeUGCbNkGWFbjxmHj
```

#### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

#### Step 6: Get Your URL
Your webhook URL will be:
```
https://your-project-name.vercel.app/api/webhook/project-financing
```

---

## ✅ Test It

```bash
# Replace with your actual Vercel URL
curl https://your-project-name.vercel.app/api/health
```

---

## 📝 Full Guide

See `GITHUB_VERCEL_SETUP.md` for detailed instructions with screenshots and troubleshooting.
