
-- Create performance tracking table
CREATE TABLE IF NOT EXISTS perf_feed (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  p50 NUMERIC(10,3) NOT NULL,
  p95 NUMERIC(10,3) NOT NULL,
  p99 NUMERIC(10,3) NOT NULL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on date
CREATE UNIQUE INDEX IF NOT EXISTS idx_perf_feed_date ON perf_feed(date);

-- Create table to store raw performance samples
CREATE TABLE IF NOT EXISTS perf_feed_samples (
  id SERIAL PRIMARY KEY,
  duration_ms NUMERIC(10,3) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Index for efficient percentile calculations
CREATE INDEX IF NOT EXISTS idx_perf_feed_samples_date_duration 
ON perf_feed_samples(date, duration_ms);

-- Function to calculate and store daily percentiles
CREATE OR REPLACE FUNCTION calculate_daily_feed_percentiles(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  p50_val NUMERIC(10,3);
  p95_val NUMERIC(10,3);
  p99_val NUMERIC(10,3);
  sample_cnt INTEGER;
BEGIN
  -- Calculate percentiles for the target date
  SELECT 
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms),
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms),
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms),
    COUNT(*)
  INTO p50_val, p95_val, p99_val, sample_cnt
  FROM perf_feed_samples 
  WHERE date = target_date;

  -- Only proceed if we have samples
  IF sample_cnt > 0 THEN
    -- Insert or update the daily percentiles
    INSERT INTO perf_feed (date, p50, p95, p99, sample_count)
    VALUES (target_date, p50_val, p95_val, p99_val, sample_cnt)
    ON CONFLICT (date) 
    DO UPDATE SET 
      p50 = EXCLUDED.p50,
      p95 = EXCLUDED.p95,
      p99 = EXCLUDED.p99,
      sample_count = EXCLUDED.sample_count,
      updated_at = NOW();
      
    -- Log to console
    RAISE NOTICE 'Feed Performance for %: p50=%.3f ms, p95=%.3f ms, p99=%.3f ms (samples: %)', 
      target_date, p50_val, p95_val, p99_val, sample_cnt;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to log feed performance sample
CREATE OR REPLACE FUNCTION log_feed_performance(duration_ms NUMERIC)
RETURNS VOID AS $$
BEGIN
  INSERT INTO perf_feed_samples (duration_ms) VALUES (duration_ms);
  
  -- Log to console with percentile context
  RAISE NOTICE 'Feed search took %.3f ms', duration_ms;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily percentile calculation at 23:55 every day
SELECT cron.schedule(
  'calculate-daily-feed-percentiles',
  '55 23 * * *',
  'SELECT calculate_daily_feed_percentiles(CURRENT_DATE);'
);

-- Also calculate for yesterday at startup to ensure we don't miss data
SELECT calculate_daily_feed_percentiles(CURRENT_DATE - INTERVAL '1 day');
