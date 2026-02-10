# Deployment Checklist

## ✅ Code Status
- ✅ Code pushed to GitHub
- ✅ Latest commit: "Add project_name field to schema and update frontend to display it"

## 🔧 Required Actions

### Step 1: Update Supabase Database
**IMPORTANT**: Run this SQL in Supabase SQL Editor before testing:

```sql
ALTER TABLE project_financing_data
ADD COLUMN IF NOT EXISTS project_name TEXT;

CREATE INDEX IF NOT EXISTS idx_project_financing_project_name 
ON project_financing_data(project_name);
```

**Location**: Supabase Dashboard → SQL Editor → New Query → Paste above → Run

### Step 2: Verify Vercel Environment Variables
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
- ✅ `SUPABASE_URL` (already set)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (already set)
- ✅ `SUPABASE_ANON_KEY` (already set)
- ✅ `SNAPTABLE_API_URL` (already set)
- ✅ `SNAPTABLE_API_TOKEN` (already set)
- ✅ `VITE_SUPABASE_URL` (for frontend - should be set)
- ✅ `VITE_SUPABASE_ANON_KEY` (for frontend - should be set)

### Step 3: Check Vercel Deployment
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Check **Deployments** tab
4. Latest deployment should show:
   - Status: ✅ Ready (or Building...)
   - Commit: "Add project_name field to schema..."
   
### Step 4: Trigger Deployment (if needed)
If Vercel didn't auto-deploy:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## 🎯 After Deployment

### Your Dashboard URL:
```
https://loan-origination-dashboard.vercel.app
```

### Test the Dashboard:
1. Open the URL above
2. Navigate to **Project Financing** → **Risk Dashboard**
3. You should see:
   - Project names in the applications table
   - All risk metrics and charts
   - Recent applications with project names

### Test Webhook with project_name:
```bash
curl -X POST https://loan-origination-dashboard.vercel.app/api/webhook/project-financing \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Sunset Apartments Development",
    "loan_to_value_ratio": 0.603,
    "loan_to_cost_ratio": 0.692
  }'
```

Then check:
- Vercel logs show the webhook was received
- Supabase has the new record with `project_name`
- Dashboard displays the project name

## 📋 What Was Deployed

### Backend (API):
- ✅ Webhook handler extracts `project_name` from webhook data
- ✅ Saves `project_name` to Supabase
- ✅ Handles multiple field name formats (snake_case, camelCase, kebab-case)

### Frontend (Dashboard):
- ✅ Risk Dashboard shows project names
- ✅ Application List displays project names prominently
- ✅ Application Detail shows project name in header
- ✅ Search works with project names
- ✅ All components updated to show project_name

### Database:
- ⚠️ **You need to run the SQL migration** (see Step 1 above)

## 🚨 Important Notes

1. **Database Migration Required**: The `project_name` column must be added to Supabase before new webhooks will save this field. Existing records will have `NULL` for project_name.

2. **Environment Variables**: Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel for the frontend to work.

3. **Deployment Time**: Vercel deployments typically take 1-3 minutes.

## ✅ Verification Steps

After deployment completes:

1. **Check Dashboard Loads**: Visit the URL and verify it loads
2. **Check API Works**: Test the webhook endpoint
3. **Check Data Saves**: Verify new webhook data includes project_name in Supabase
4. **Check Frontend Displays**: Verify project names show in the dashboard
