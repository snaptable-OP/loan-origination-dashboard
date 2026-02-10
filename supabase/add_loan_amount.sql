-- Add loan_amount column to project_financing_data table
-- This column stores the actual loan amount from Snaptable

ALTER TABLE project_financing_data 
ADD COLUMN IF NOT EXISTS loan_amount DECIMAL(15, 2);

-- Add index for loan_amount queries
CREATE INDEX IF NOT EXISTS idx_project_financing_loan_amount ON project_financing_data(loan_amount);

-- Add comment to document the column
COMMENT ON COLUMN project_financing_data.loan_amount IS 'The actual loan amount (can be provided directly or calculated from LTV * as_is_valuation)';
