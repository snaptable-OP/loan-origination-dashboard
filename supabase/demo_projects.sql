-- Add demo projects to showcase the dashboard
-- These are sample projects with realistic data

INSERT INTO project_financing_data (
  project_name,
  loan_amount,
  loan_to_value_ratio,
  loan_to_cost_ratio,
  as_is_valuation_of_project,
  as_if_complete_valuation_of_project,
  expected_presales,
  contingency_sum,
  contingency_sum_percentage_of_project_cost,
  total_units,
  bedrooms_per_unit,
  area_per_unit_sqm,
  market_comparable_price
) VALUES
-- Project 1: 8 Squirrell Lane (existing, update if needed)
(
  '8 Squirrell Lane',
  916560,
  0.75,
  0.80,
  1222080,
  1500000,
  1200000,
  50000,
  2.5,
  4,
  3,
  120.5,
  1250000
),
-- Project 2: Riverside Apartments
(
  'Riverside Apartments',
  2500000,
  0.70,
  0.75,
  3571429,
  4200000,
  3800000,
  150000,
  3.0,
  12,
  2,
  85.0,
  3650000
),
-- Project 3: Harbour View Residences
(
  'Harbour View Residences',
  4500000,
  0.65,
  0.70,
  6923077,
  8500000,
  8000000,
  300000,
  2.8,
  20,
  3,
  110.0,
  7200000
),
-- Project 4: Mountain Heights Development
(
  'Mountain Heights Development',
  1800000,
  0.72,
  0.78,
  2500000,
  3000000,
  2800000,
  120000,
  3.2,
  8,
  4,
  150.0,
  2400000
),
-- Project 5: Coastal Living Complex
(
  'Coastal Living Complex',
  3200000,
  0.68,
  0.73,
  4705882,
  5800000,
  5500000,
  200000,
  2.6,
  15,
  2,
  95.0,
  4800000
),
-- Project 6: Urban Loft Project
(
  'Urban Loft Project',
  1200000,
  0.75,
  0.82,
  1600000,
  1950000,
  1800000,
  80000,
  2.9,
  6,
  2,
  75.0,
  1680000
)
ON CONFLICT DO NOTHING;

-- Add some drawdown schedules for demo projects
-- (This will link to the projects created above)
INSERT INTO drawdown_schedules (
  project_financing_data_id,
  construction_milestone,
  drawdown_sum_for_milestone,
  sequence_number
)
SELECT 
  pfd.id,
  milestone,
  percentage,
  seq
FROM project_financing_data pfd
CROSS JOIN (
  VALUES
    ('Site Preparation', 0.10, 1),
    ('Foundation Complete', 0.15, 2),
    ('Frame Complete', 0.20, 3),
    ('Lock-up Complete', 0.25, 4),
    ('Fit-out Complete', 0.20, 5),
    ('Final Inspection', 0.10, 6)
) AS milestones(milestone, percentage, seq)
WHERE pfd.project_name IN (
  'Riverside Apartments',
  'Harbour View Residences',
  'Mountain Heights Development',
  'Coastal Living Complex',
  'Urban Loft Project'
)
ON CONFLICT DO NOTHING;
