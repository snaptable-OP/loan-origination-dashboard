-- Check for webhook data sent at 1:37pm
-- Adjust the time range based on your timezone (this assumes UTC)

-- 1. Check if any data was saved around 1:37pm
SELECT 
  id,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project,
  as_if_complete_valuation_of_project,
  expected_presales,
  contingency_sum,
  contingency_sum_percentage_of_project_cost,
  created_at,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at_formatted,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 60 as minutes_ago
FROM project_financing_data
WHERE created_at >= NOW() - INTERVAL '30 minutes'
  AND created_at <= NOW() + INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- 2. Get the most recent record (should be the 1:37pm one if it worked)
SELECT 
  id,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project,
  as_if_complete_valuation_of_project,
  created_at,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at_formatted
FROM project_financing_data
ORDER BY created_at DESC
LIMIT 1;

-- 3. Check all related data for the latest record
WITH latest_project AS (
  SELECT id, created_at
  FROM project_financing_data
  ORDER BY created_at DESC
  LIMIT 1
)
SELECT 
  'Main Record' as data_type,
  lp.id,
  lp.created_at,
  p.loan_to_value_ratio,
  p.loan_to_cost_ratio
FROM latest_project lp
JOIN project_financing_data p ON lp.id = p.id
UNION ALL
SELECT 
  'Drawdowns' as data_type,
  lp.id,
  lp.created_at,
  COUNT(d.id)::text as count,
  NULL
FROM latest_project lp
LEFT JOIN drawdown_schedules d ON lp.id = d.project_financing_data_id
GROUP BY lp.id, lp.created_at
UNION ALL
SELECT 
  'Permits' as data_type,
  lp.id,
  lp.created_at,
  COUNT(pa.id)::text as count,
  NULL
FROM latest_project lp
LEFT JOIN permits_and_approvals pa ON lp.id = pa.project_financing_data_id
GROUP BY lp.id, lp.created_at
UNION ALL
SELECT 
  'Terms' as data_type,
  lp.id,
  lp.created_at,
  COUNT(ctr.id)::text as count,
  NULL
FROM latest_project lp
LEFT JOIN contractual_terms_and_risks ctr ON lp.id = ctr.project_financing_data_id
GROUP BY lp.id, lp.created_at;
