-- Quick verification queries for webhook data
-- Run these in Supabase SQL Editor to check if data was received

-- 1. Check if any project financing data exists
SELECT 
  COUNT(*) as total_records,
  MAX(created_at) as latest_record,
  MIN(created_at) as oldest_record
FROM project_financing_data;

-- 2. View latest project financing data
SELECT 
  id,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project,
  as_if_complete_valuation_of_project,
  expected_presales,
  contingency_sum,
  contingency_sum_percentage_of_project_cost,
  created_at
FROM project_financing_data
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check drawdown schedules count and details
SELECT 
  COUNT(*) as total_drawdowns,
  COUNT(DISTINCT project_financing_data_id) as projects_with_drawdowns
FROM drawdown_schedules;

-- View latest drawdown schedules
SELECT 
  d.id,
  d.construction_milestone,
  d.drawdown_sum_for_milestone,
  d.sequence_number,
  p.created_at as project_created_at
FROM drawdown_schedules d
JOIN project_financing_data p ON d.project_financing_data_id = p.id
ORDER BY p.created_at DESC, d.sequence_number
LIMIT 20;

-- 4. Check permits and approvals
SELECT 
  COUNT(*) as total_permits,
  COUNT(DISTINCT project_financing_data_id) as projects_with_permits
FROM permits_and_approvals;

-- View latest permits
SELECT 
  pa.id,
  pa.document_id,
  pa.permit_or_approval_document_name,
  p.created_at as project_created_at
FROM permits_and_approvals pa
JOIN project_financing_data p ON pa.project_financing_data_id = p.id
ORDER BY p.created_at DESC
LIMIT 20;

-- 5. Check contractual terms and risks
SELECT 
  COUNT(*) as total_terms,
  COUNT(DISTINCT project_financing_data_id) as projects_with_terms
FROM contractual_terms_and_risks;

-- View latest terms
SELECT 
  ctr.id,
  LEFT(ctr.risk_assessment, 100) as risk_assessment_preview,
  LEFT(ctr.contractual_clause, 100) as contractual_clause_preview,
  p.created_at as project_created_at
FROM contractual_terms_and_risks ctr
JOIN project_financing_data p ON ctr.project_financing_data_id = p.id
ORDER BY p.created_at DESC
LIMIT 20;

-- 6. Summary of all tables
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

-- 7. Complete project view (all related data for latest project)
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
  (SELECT COUNT(*) FROM drawdown_schedules WHERE project_financing_data_id = p.id) as drawdown_count,
  (SELECT COUNT(*) FROM permits_and_approvals WHERE project_financing_data_id = p.id) as permits_count,
  (SELECT COUNT(*) FROM contractual_terms_and_risks WHERE project_financing_data_id = p.id) as terms_count
FROM project_financing_data p
ORDER BY p.created_at DESC
LIMIT 1;
