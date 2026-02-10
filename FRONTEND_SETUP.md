# Frontend Dashboard Setup

## Overview

A comprehensive risk analysis dashboard for non-bank lenders to monitor and analyze development loan applications. The dashboard provides:

- **Risk Dashboard**: Overview with key metrics, risk distribution, and recent applications
- **Application List**: View all loan applications with filtering and search
- **Application Detail**: Detailed view of each loan application with all related data

## Features

### Risk Analysis
- **Risk Scoring Algorithm**: Calculates risk score (0-10) based on:
  - Loan-to-Value (LTV) ratio
  - Loan-to-Cost (LTC) ratio
  - Valuation gap (as-is vs as-if-complete)
  - Contingency percentage
- **Risk Levels**: 
  - High Risk (7-10): Red indicators
  - Medium Risk (4-6): Yellow indicators
  - Low Risk (0-3): Green indicators

### Key Metrics
- Total loan applications
- Total loan value
- Average LTV and LTC ratios
- Risk distribution (High/Medium/Low)
- Risk score distribution chart

### Application Details
- Loan amount calculations
- Property valuations (as-is and as-if-complete)
- Drawdown schedules with milestone tracking
- Permits and approvals status
- Contractual terms and risk assessments

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://zzodexvvxyyndilxtmsm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tpmnMN6GqnhRuzH7IzPyaw_vaFarsIZ
```

**Important**: In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Navigation

The sidebar includes two sections:

### General
- Dashboard (original)
- Applications (original)
- New Application (original)
- Analytics (original)

### Project Financing
- **Risk Dashboard**: Overview with metrics and risk analysis
- **All Applications**: List view with filtering and search

## Components

### ProjectFinancingDashboard
Main dashboard showing:
- Key metrics cards
- Risk distribution
- Risk score distribution chart
- Recent applications table

### ProjectFinancingList
List view with:
- Search functionality
- Risk level filtering (All/High/Medium/Low)
- Application details table
- View detail action

### ProjectFinancingDetail
Detailed view showing:
- Risk score and level
- Key financial metrics
- Property valuations
- Drawdown schedule visualization
- Permits and approvals
- Contractual terms and risk assessments

## Risk Scoring Algorithm

The risk score is calculated based on:

1. **LTV Ratio** (0-3 points):
   - > 80%: 3 points (High risk)
   - 70-80%: 2 points (Medium risk)
   - 60-70%: 1 point (Low risk)
   - < 60%: 0 points

2. **LTC Ratio** (0-2 points):
   - > 85%: 2 points
   - 75-85%: 1 point
   - < 75%: 0 points

3. **Valuation Gap** (0-2 points):
   - > 200% increase: 2 points
   - 150-200% increase: 1 point
   - < 150%: 0 points

4. **Contingency** (0-1 point):
   - < 1% of project cost: 1 point
   - ≥ 1%: 0 points

**Total Score**: 0-10 (capped at 10)

## Data Flow

1. Webhook receives data → Snaptable transforms → Supabase stores
2. Frontend queries Supabase using Supabase client
3. Components calculate risk scores and display metrics
4. Users can filter, search, and view detailed information

## Styling

The dashboard uses:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Modern, clean design with color-coded risk indicators

## Troubleshooting

### No Data Showing
1. Check that environment variables are set correctly
2. Verify Supabase connection in browser console
3. Check that data exists in Supabase tables

### Supabase Connection Issues
1. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Check browser console for connection errors
3. Verify Supabase project is active

### Build Issues
1. Make sure all dependencies are installed: `npm install`
2. Check for TypeScript/ESLint errors
3. Verify environment variables are set before building
