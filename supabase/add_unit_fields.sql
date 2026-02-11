-- Add unit quantity, bedrooms, and area fields to project_financing_data

ALTER TABLE project_financing_data 
ADD COLUMN IF NOT EXISTS total_units INTEGER,
ADD COLUMN IF NOT EXISTS bedrooms_per_unit INTEGER,
ADD COLUMN IF NOT EXISTS area_per_unit_sqm DECIMAL(10, 2);

-- Add comment
COMMENT ON COLUMN project_financing_data.total_units IS 'Total number of units to be built on the land';
COMMENT ON COLUMN project_financing_data.bedrooms_per_unit IS 'Number of bedrooms per unit';
COMMENT ON COLUMN project_financing_data.area_per_unit_sqm IS 'Area of each unit in square meters';
