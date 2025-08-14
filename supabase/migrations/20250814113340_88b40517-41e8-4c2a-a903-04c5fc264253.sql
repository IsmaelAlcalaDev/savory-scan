
-- Add profile_views column to restaurant_metrics table
ALTER TABLE restaurant_metrics 
ADD COLUMN IF NOT EXISTS profile_views_total INTEGER DEFAULT 0;

-- Add profile_views_today column for daily tracking
ALTER TABLE restaurant_metrics 
ADD COLUMN IF NOT EXISTS profile_views_today INTEGER DEFAULT 0;

-- Add profile_views_week column for weekly tracking  
ALTER TABLE restaurant_metrics 
ADD COLUMN IF NOT EXISTS profile_views_week INTEGER DEFAULT 0;

-- Add profile_views_month column for monthly tracking
ALTER TABLE restaurant_metrics 
ADD COLUMN IF NOT EXISTS profile_views_month INTEGER DEFAULT 0;

-- Create or update the function to track profile views
CREATE OR REPLACE FUNCTION track_profile_view(restaurant_id_param INTEGER)
RETURNS void AS $$
BEGIN
  -- Insert or update restaurant metrics for today
  INSERT INTO restaurant_metrics (
    restaurant_id, 
    metric_date, 
    profile_views, 
    profile_views_total,
    profile_views_today,
    profile_views_week,
    profile_views_month
  )
  VALUES (
    restaurant_id_param, 
    CURRENT_DATE, 
    1, 
    1,
    1,
    1,
    1
  )
  ON CONFLICT (restaurant_id, metric_date) 
  DO UPDATE SET 
    profile_views = restaurant_metrics.profile_views + 1,
    profile_views_total = restaurant_metrics.profile_views_total + 1,
    profile_views_today = restaurant_metrics.profile_views_today + 1,
    profile_views_week = restaurant_metrics.profile_views_week + 1,
    profile_views_month = restaurant_metrics.profile_views_month + 1,
    updated_at = CURRENT_TIMESTAMP;

  -- Also update the restaurants table with total profile views
  UPDATE restaurants 
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1
  WHERE id = restaurant_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add profile_views_count column to restaurants table if it doesn't exist
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0;
