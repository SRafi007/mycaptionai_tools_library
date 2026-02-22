-- ============================================================
-- MyCaptionAI - Schema Update V6 (Simple + Action-Focused Analytics)
-- Run this AFTER schema.sql / existing updates
-- ============================================================

-- 1) Add direct fields used by the app for faster querying
ALTER TABLE IF EXISTS analytics
  ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS visitor_id TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS user_agent_hash TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS page_title TEXT,
  ADD COLUMN IF NOT EXISTS action_name TEXT,
  ADD COLUMN IF NOT EXISTS action_target TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_occurred_at ON analytics(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_path_occurred ON analytics(path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_path_occurred
  ON analytics(event_type, path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_action_occurred
  ON analytics(action_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);

-- 2) Remove redundant derived tables/functions (single table write path)
DROP FUNCTION IF EXISTS refresh_analytics_daily_metrics(DATE, DATE);
DROP FUNCTION IF EXISTS purge_old_analytics(INT);

DROP TABLE IF EXISTS analytics_daily_metrics CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;

-- 3) Keep analytics table RLS strict for service role
ALTER TABLE IF EXISTS analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Admins can view analytics" ON analytics;
DROP POLICY IF EXISTS "Service role can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Service role can read analytics" ON analytics;
DROP POLICY IF EXISTS "Service role can update analytics" ON analytics;

CREATE POLICY "Service role can insert analytics"
  ON analytics FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read analytics"
  ON analytics FOR SELECT
  TO service_role
  USING (true);

