-- Add project_name column to project_financing_data table
-- Run this in Supabase SQL Editor

ALTER TABLE project_financing_data
ADD COLUMN IF NOT EXISTS project_name TEXT;

-- Add index for faster searches by project name
CREATE INDEX IF NOT EXISTS idx_project_financing_project_name 
ON project_financing_data(project_name);

-- Add comment to document the column
COMMENT ON COLUMN project_financing_data.project_name IS 'Name of the development project';
