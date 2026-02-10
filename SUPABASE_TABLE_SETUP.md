# How to Create Tables in Supabase

## Method 1: Using SQL Editor (Recommended)

### Step-by-Step Instructions:

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `zzodexvvxyyndilxtmsm`

2. **Navigate to SQL Editor**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Run the Schema SQL**
   - Copy the entire contents of `supabase/schema.sql` file
   - Paste it into the SQL Editor
   - Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

4. **Verify Tables Created**
   - Go to **"Table Editor"** in the left sidebar
   - You should see two tables:
     - `loan_applications`
     - `project_financing_data`

## Method 2: Using Table Editor (Visual)

### For Basic Tables:

1. **Open Table Editor**
   - Go to **"Table Editor"** in the left sidebar
   - Click **"New Table"**

2. **Create Table Manually**
   - Enter table name: `project_financing_data`
   - Add columns one by one using the UI
   - This method is more time-consuming but visual

## Method 3: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref zzodexvvxyyndilxtmsm

# Run migrations
supabase db push
```

## Table Structure: `project_financing_data`

This table stores development loan project financing data with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `loan_application_id` | UUID | Foreign key to `loan_applications` table |
| `loan_to_value_ratio` | DECIMAL(10,4) | Loan-to-value ratio |
| `loan_to_cost_ratio` | DECIMAL(10,4) | Loan-to-cost ratio |
| `as_is_valuation_of_project` | DECIMAL(15,2) | Current land value |
| `as_if_complete_valuation_of_project` | DECIMAL(15,2) | Gross realization value if fully sold |
| `drawdown_schedule` | JSONB | Array of drawdown entries |
| `expected_presales` | DECIMAL(15,2) | Required pre-sales amount |
| `existing_permits_and_approvals` | JSONB | Array of permits and approvals |
| `contractual_term_and_risk_assessment` | JSONB | Array of contractual terms and risks |
| `contingency_sum` | JSONB | Contingency sum details object |
| `created_at` | TIMESTAMP | Auto-generated creation timestamp |
| `updated_at` | TIMESTAMP | Auto-updated modification timestamp |

## Example JSON Data Structures

### Drawdown Schedule:
```json
[
  {
    "date": "2024-01-15",
    "amount": 50000,
    "milestone": "Foundation Complete",
    "percentage": 10
  },
  {
    "date": "2024-03-01",
    "amount": 100000,
    "milestone": "Framing Complete",
    "percentage": 20
  }
]
```

### Existing Permits and Approvals:
```json
[
  {
    "type": "Building Permit",
    "status": "Approved",
    "date": "2024-01-10",
    "reference_number": "BP-2024-001"
  },
  {
    "type": "Planning Approval",
    "status": "Pending",
    "date": null,
    "reference_number": null
  }
]
```

### Contractual Term and Risk Assessment:
```json
[
  {
    "term": "Fixed Price Contract",
    "risk_level": "Low",
    "description": "Contractor locked in at fixed price",
    "mitigation": "Regular progress reviews"
  },
  {
    "term": "Material Cost Escalation",
    "risk_level": "Medium",
    "description": "Potential increase in material costs",
    "mitigation": "Contingency buffer included"
  }
]
```

### Contingency Sum:
```json
{
  "amount": 50000,
  "percentage": 5,
  "allocated_for": "Construction delays and material cost escalation",
  "breakdown": {
    "construction_delays": 30000,
    "material_escalation": 20000
  }
}
```

## Troubleshooting

### If you get "relation already exists" error:
- The table already exists. You can either:
  - Drop it first: `DROP TABLE IF EXISTS project_financing_data CASCADE;`
  - Or use `CREATE TABLE IF NOT EXISTS` (already included in the schema)

### If you get foreign key constraint error:
- Make sure `loan_applications` table exists first
- Run the `loan_applications` table creation SQL before `project_financing_data`

### If JSONB fields show errors:
- Make sure your JSON is valid
- Use `'[]'::jsonb` for empty arrays
- Use `NULL` for optional object fields

## Next Steps

After creating the tables:
1. Set up Row Level Security (RLS) policies if needed
2. Update your webhook handler to save project financing data
3. Test inserting data through the webhook endpoint
