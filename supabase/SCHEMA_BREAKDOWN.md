# Schema Breakdown - JSONB to Individual Columns

All JSONB fields have been broken down into individual columns and separate tables for better data integrity and querying.

## Main Table: `project_financing_data`

### Individual Columns:
- `id` (UUID) - Primary key
- `loan_application_id` (UUID) - Foreign key to loan_applications
- `loan_to_value_ratio` (DECIMAL)
- `loan_to_cost_ratio` (DECIMAL)
- `as_is_valuation_of_project` (DECIMAL)
- `as_if_complete_valuation_of_project` (DECIMAL)
- `expected_presales` (DECIMAL)
- `contingency_sum_amount` (DECIMAL) - **From contingency_sum JSONB object**
- `contingency_sum_percentage` (DECIMAL) - **From contingency_sum JSONB object**
- `contingency_sum_allocated_for` (TEXT) - **From contingency_sum JSONB object**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Related Tables (for array data):

### 1. `drawdown_schedules` Table
**Replaces:** `drawdown_schedule` JSONB array

Each row represents one drawdown entry:
- `id` (UUID) - Primary key
- `project_financing_data_id` (UUID) - Foreign key
- `drawdown_date` (DATE)
- `drawdown_amount` (DECIMAL)
- `milestone` (TEXT)
- `percentage` (DECIMAL)
- `sequence_number` (INTEGER)
- `created_at` (TIMESTAMP)

**Example:** If you had 3 drawdowns in the array, you'll now have 3 rows in this table.

### 2. `permits_and_approvals` Table
**Replaces:** `existing_permits_and_approvals` JSONB array

Each row represents one permit/approval:
- `id` (UUID) - Primary key
- `project_financing_data_id` (UUID) - Foreign key
- `permit_type` (TEXT)
- `status` (TEXT)
- `approval_date` (DATE)
- `reference_number` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

**Example:** If you had 5 permits in the array, you'll now have 5 rows in this table.

### 3. `contractual_terms_and_risks` Table
**Replaces:** `contractual_term_and_risk_assessment` JSONB array

Each row represents one contractual term/risk:
- `id` (UUID) - Primary key
- `project_financing_data_id` (UUID) - Foreign key
- `term` (TEXT)
- `risk_level` (TEXT)
- `description` (TEXT)
- `mitigation` (TEXT)
- `created_at` (TIMESTAMP)

**Example:** If you had 4 terms in the array, you'll now have 4 rows in this table.

## Data Migration Example

### Before (JSONB):
```json
{
  "contingency_sum": {
    "amount": 50000,
    "percentage": 5,
    "allocated_for": "Construction delays"
  },
  "drawdown_schedule": [
    {"date": "2024-01-15", "amount": 50000, "milestone": "Foundation"},
    {"date": "2024-03-01", "amount": 100000, "milestone": "Framing"}
  ]
}
```

### After (Individual Columns + Tables):

**project_financing_data row:**
```
contingency_sum_amount: 50000
contingency_sum_percentage: 5
contingency_sum_allocated_for: "Construction delays"
```

**drawdown_schedules rows (2 rows):**
```
Row 1: drawdown_date: 2024-01-15, drawdown_amount: 50000, milestone: "Foundation"
Row 2: drawdown_date: 2024-03-01, drawdown_amount: 100000, milestone: "Framing"
```

## Benefits of This Structure

1. **Better Querying**: Can query individual fields without JSONB operators
2. **Data Integrity**: Foreign key constraints ensure referential integrity
3. **Indexing**: Can create indexes on individual columns for better performance
4. **Type Safety**: Each field has a specific data type
5. **Easier Joins**: Can join tables using foreign keys
6. **Validation**: Can add CHECK constraints on individual columns

## Querying Examples

### Get all drawdowns for a project:
```sql
SELECT * FROM drawdown_schedules 
WHERE project_financing_data_id = '...'
ORDER BY sequence_number;
```

### Get all approved permits:
```sql
SELECT * FROM permits_and_approvals 
WHERE project_financing_data_id = '...' 
AND status = 'Approved';
```

### Get high-risk contractual terms:
```sql
SELECT * FROM contractual_terms_and_risks 
WHERE project_financing_data_id = '...' 
AND risk_level = 'High';
```
