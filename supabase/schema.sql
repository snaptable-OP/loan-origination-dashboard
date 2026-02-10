-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT UNIQUE NOT NULL,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('mortgage', 'personal', 'business', 'auto')),
  amount DECIMAL(15, 2) NOT NULL,
  purpose TEXT,
  employment_status TEXT CHECK (employment_status IN ('employed', 'self-employed', 'unemployed', 'retired')),
  annual_income DECIMAL(15, 2),
  credit_score INTEGER CHECK (credit_score >= 300 AND credit_score <= 850),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on application_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_loan_applications_application_id ON loan_applications(application_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);

-- Create index on email for searching
CREATE INDEX IF NOT EXISTS idx_loan_applications_email ON loan_applications(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate application_id (LO-YYYY-NNN format)
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_id FROM 'LO-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM loan_applications
  WHERE application_id LIKE 'LO-' || year_part || '-%';
  
  new_id := 'LO-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create project_financing_data table for development loan project financing data
-- All JSONB fields have been broken down into individual columns
CREATE TABLE IF NOT EXISTS project_financing_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  
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
CREATE TABLE IF NOT EXISTS drawdown_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  construction_milestone TEXT NOT NULL,
  drawdown_sum_for_milestone DECIMAL(5, 4) NOT NULL,
  sequence_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permits_and_approvals table (one row per permit/approval)
CREATE TABLE IF NOT EXISTS permits_and_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_financing_data_id UUID REFERENCES project_financing_data(id) ON DELETE CASCADE,
  document_id TEXT,
  permit_or_approval_document_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contractual_terms_and_risks table (one row per term/risk)
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
