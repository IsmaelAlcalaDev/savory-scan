
-- Add some premium restaurants for testing the recommended sorting
UPDATE restaurants 
SET subscription_plan = 'premium' 
WHERE id IN (
  SELECT id 
  FROM restaurants 
  WHERE is_active = true 
  AND is_published = true 
  LIMIT 3
);
