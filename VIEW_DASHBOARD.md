# How to View the Dashboard

## Option 1: View Locally (Right Now - 2 minutes)

### Step 1: Create `.env` file
Create a file named `.env` in the root directory:

```env
VITE_SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
```

### Step 2: Install dependencies and run
```bash
npm install
npm run dev
```

### Step 3: Open browser
Go to: **http://localhost:5173**

### Step 4: Navigate to Dashboard
1. Look at the sidebar on the left
2. Find the **"Project Financing"** section
3. Click **"Risk Dashboard"** to see the overview
4. Click **"All Applications"** to see the list

## Option 2: Deploy to Vercel (Permanent URL)

### Step 1: Add Environment Variables in Vercel
1. Go to: https://vercel.com/dashboard
2. Click your project: `loan-origination-dashboard`
3. Go to **Settings** → **Environment Variables**
4. Add these **NEW** variables:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://zzodexvvxyyndilxtmsm.supabase.co`
   - **Environments**: Select all (Production, Preview, Development)
   
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ`
   - **Environments**: Select all

### Step 2: Push code to GitHub
```bash
git add .
git commit -m "Add project financing dashboard frontend"
git push
```

### Step 3: Vercel will auto-deploy
- Vercel will detect the new `vercel.json` file
- It will build the frontend automatically
- Your dashboard will be at: `https://loan-origination-dashboard.vercel.app`

## What You'll See

### Risk Dashboard
- **Key Metrics**: Total applications, loan value, average LTV/LTC
- **Risk Distribution**: High/Medium/Low risk counts
- **Risk Score Chart**: Visual distribution of risk scores
- **Recent Applications**: Latest 5 applications with risk indicators

### All Applications
- **Full List**: All loan applications
- **Search**: Filter by application ID
- **Risk Filters**: Filter by High/Medium/Low risk
- **View Details**: Click "View" to see full application details

### Application Detail
- **Risk Score**: 0-10 score with color-coded level
- **Financial Metrics**: Loan amount, LTV, LTC, contingency
- **Valuations**: As-is vs As-if-complete comparison
- **Drawdown Schedule**: Visual timeline of construction milestones
- **Permits**: List of permits and approvals
- **Risk Assessments**: Contractual terms and risk analysis

## Quick Start (Local)

Run these commands:

```bash
# Create .env file
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
EOF

# Install and run
npm install
npm run dev
```

Then open: **http://localhost:5173**
