# How to Verify Webhook Data Was Received and Saved

## 1. Check Server Logs

If your server is running, check the terminal/console where you ran `npm run server`. You should see:
- `Webhook received at: [timestamp]`
- `Received data: [JSON data]`
- `Data transformed by Snaptable: [response]` (if Snaptable succeeded)
- `Application saved successfully:` or `Project financing data saved`

## 2. Check Supabase Database

### Option A: Using Supabase Dashboard (Visual)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zzodexvvxyyndilxtmsm
2. Click on **"Table Editor"** in the left sidebar
3. Check these tables:
   - `project_financing_data` - Main project financing data
   - `drawdown_schedules` - Drawdown milestones
   - `permits_and_approvals` - Permits and approvals
   - `contractual_terms_and_risks` - Contractual terms and risks

### Option B: Using SQL Queries

Run these queries in Supabase SQL Editor to verify data:

#### Check Recent Project Financing Data:
```sql
SELECT 
  id,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project,
  as_if_complete_valuation_of_project,
  expected_presales,
  contingency_sum,
  created_at
FROM project_financing_data
ORDER BY created_at DESC
LIMIT 10;
```

#### Check Drawdown Schedules:
```sql
SELECT 
  d.id,
  d.construction_milestone,
  d.drawdown_sum_for_milestone,
  d.sequence_number,
  p.loan_to_value_ratio,
  d.created_at
FROM drawdown_schedules d
JOIN project_financing_data p ON d.project_financing_data_id = p.id
ORDER BY p.created_at DESC, d.sequence_number
LIMIT 20;
```

#### Check Permits and Approvals:
```sql
SELECT 
  pa.id,
  pa.document_id,
  pa.permit_or_approval_document_name,
  p.loan_to_value_ratio,
  pa.created_at
FROM permits_and_approvals pa
JOIN project_financing_data p ON pa.project_financing_data_id = p.id
ORDER BY p.created_at DESC
LIMIT 20;
```

#### Check Contractual Terms and Risks:
```sql
SELECT 
  ctr.id,
  ctr.risk_assessment,
  ctr.contractual_clause,
  p.loan_to_value_ratio,
  ctr.created_at
FROM contractual_terms_and_risks ctr
JOIN project_financing_data p ON ctr.project_financing_data_id = p.id
ORDER BY p.created_at DESC
LIMIT 20;
```

#### Count Records by Table:
```sql
SELECT 
  'project_financing_data' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM project_financing_data
UNION ALL
SELECT 
  'drawdown_schedules' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM drawdown_schedules
UNION ALL
SELECT 
  'permits_and_approvals' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM permits_and_approvals
UNION ALL
SELECT 
  'contractual_terms_and_risks' as table_name,
  COUNT(*) as record_count,
  MAX(created_at) as latest_record
FROM contractual_terms_and_risks;
```

## 3. Check for Errors

### If No Data Appears:

1. **Check Server Logs** - Look for error messages
2. **Check Snaptable API** - Verify if transformation failed
3. **Check Database Connection** - Verify Supabase credentials in `.env`
4. **Check Table Existence** - Make sure tables were created

### Common Issues:

- **"relation does not exist"** - Tables haven't been created yet. Run the SQL schema.
- **"permission denied"** - Check your Supabase service role key
- **"connection refused"** - Server might not be running or wrong URL

## 4. Test the Webhook Manually

You can test if the webhook is working by sending a test request:

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
    "existing_permits_and_approvals": [
      {
        "document_id": "BUN60443614",
        "permit_or_approval_document_name": "Resource Consent"
      }
    ],
    "contractual_term_and_risk_assessment": [
      {
        "risk_assessment": "Test risk",
        "contractual_clause": "Test clause"
      }
    ],
    "contingency_sum": {
      "contingency_sum": 45770,
      "percentage_of_project_cost": 2
    }
  }'
```

## 5. View Complete Project Data

To see all related data for a specific project:

```sql
-- Get complete project financing data with all related records
SELECT 
  p.id as project_id,
  p.loan_to_value_ratio,
  p.loan_to_cost_ratio,
  p.as_is_valuation_of_project,
  p.as_if_complete_valuation_of_project,
  p.expected_presales,
  p.contingency_sum,
  p.contingency_sum_percentage_of_project_cost,
  p.created_at,
  -- Drawdown count
  (SELECT COUNT(*) FROM drawdown_schedules WHERE project_financing_data_id = p.id) as drawdown_count,
  -- Permits count
  (SELECT COUNT(*) FROM permits_and_approvals WHERE project_financing_data_id = p.id) as permits_count,
  -- Terms count
  (SELECT COUNT(*) FROM contractual_terms_and_risks WHERE project_financing_data_id = p.id) as terms_count
FROM project_financing_data p
ORDER BY p.created_at DESC
LIMIT 5;
```
