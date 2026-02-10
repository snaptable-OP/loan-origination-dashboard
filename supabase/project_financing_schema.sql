-- Project Financing Data Table Schema
-- This table stores development loan project financing data
-- All JSONB fields have been broken down into individual columns and separate tables

-- Create the function for updating timestamps first (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS project_financing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID,
  
  -- Project information
  project_name TEXT,
  
  -- Loan ratios
  loan_to_value_ratio DECIMAL(10, 4),
  loan_to_cost_ratio DECIMAL(10, 4),
  
  -- Project valuations
  as_is_valuation_of_project DECIMAL(15, 2),
  as_if_complete_valuation_of_project DECIMAL(15, 2),
  
  -- Expected presales amount
  expected_presales DECIMAL(15, 2),
  
  -- Contingency sum fields (broken down from JSONB object)
  contingency_sum DECIMAL(15, 2),
  contingency_sum_percentage_of_project_cost DECIMAL(5, 2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drawdown_schedules table (one row per drawdown entry)
-- Replaces: drawdown_schedule JSONB array
CREATE TABLE IF NOT EXISTS drawdown_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  construction_milestone TEXT NOT NULL,
  drawdown_sum_for_milestone DECIMAL(5, 4) NOT NULL,
  sequence_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permits_and_approvals table (one row per permit/approval)
-- Replaces: existing_permits_and_approvals JSONB array
CREATE TABLE IF NOT EXISTS permits_and_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  document_id TEXT,
  permit_or_approval_document_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contractual_terms_and_risks table (one row per term/risk)
-- Replaces: contractual_term_and_risk_assessment JSONB array
CREATE TABLE IF NOT EXISTS contractual_terms_and_risks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  risk_assessment TEXT NOT NULL,
  contractual_clause TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes on project_financing_data
CREATE INDEX IF NOT EXISTS idx_project_financing_loan_application_id ON project_financing_data(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_project_financing_created_at ON project_financing_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_financing_project_name ON project_financing_data(project_name);

-- Create indexes on drawdown_schedules
CREATE INDEX IF NOT EXISTS idx_drawdown_schedules_project_id ON drawdown_schedules(project_financing_data_id);
CREATE INDEX IF NOT EXISTS idx_drawdown_schedules_sequence ON drawdown_schedules(sequence_number);

-- Create indexes on permits_and_approvals
CREATE INDEX IF NOT EXISTS idx_permits_project_id ON permits_and_approvals(project_financing_data_id);
CREATE INDEX IF NOT EXISTS idx_permits_document_id ON permits_and_approvals(document_id);

-- Create indexes on contractual_terms_and_risks
CREATE INDEX IF NOT EXISTS idx_contractual_terms_project_id ON contractual_terms_and_risks(project_financing_data_id);

-- Trigger to automatically update updated_at for project_financing_data
CREATE TRIGGER update_project_financing_updated_at
  BEFORE UPDATE ON project_financing_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
