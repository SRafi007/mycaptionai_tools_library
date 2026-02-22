-- ============================================================
-- MyCaptionAI - Schema Update V5 (Analytics Hardening + Scale)
-- Run this AFTER schema.sql / existing updates
-- ============================================================

-- ------------------------------------------------------------
-- 1) Enrich analytics events with privacy-safe fields
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS analytics
  ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS session_id UUID,
  ADD COLUMN IF NOT EXISTS visitor_id TEXT,
  ADD COLUMN IF NOT EXISTS referrer_host TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS user_agent_hash TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS privacy_mode TEXT,
  ADD COLUMN IF NOT EXISTS consent_status TEXT,
  ADD COLUMN IF NOT EXISTS gpc_signal BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dnt_signal BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_occurred_at ON analytics(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_path_occurred ON analytics(path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor_id ON analytics(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_path_occurred
  ON analytics(event_type, path, occurred_at DESC);

-- ------------------------------------------------------------
-- 2) Session table for efficient reporting
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_sessions (
  session_id UUID PRIMARY KEY,
  visitor_id TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_count INT NOT NULL DEFAULT 0,
  page_views INT NOT NULL DEFAULT 0,
  device_type TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  referrer_host TEXT,
  last_path TEXT,
  consent_status TEXT,
  privacy_mode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_seen
  ON analytics_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor
  ON analytics_sessions(visitor_id);

-- ------------------------------------------------------------
-- 3) Daily rollup table (fast dashboard queries)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
  metric_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT,
  total_events INT NOT NULL DEFAULT 0,
  total_page_views INT NOT NULL DEFAULT 0,
  unique_visitors INT NOT NULL DEFAULT 0,
  unique_sessions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (metric_date, event_type, path)
);

CREATE OR REPLACE FUNCTION refresh_analytics_daily_metrics(
  p_from DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_to DATE DEFAULT CURRENT_DATE
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM analytics_daily_metrics
  WHERE metric_date BETWEEN p_from AND p_to;

  INSERT INTO analytics_daily_metrics (
    metric_date,
    event_type,
    path,
    total_events,
    total_page_views,
    unique_visitors,
    unique_sessions
  )
  SELECT
    DATE(occurred_at) AS metric_date,
    event_type,
    path,
    COUNT(*)::INT AS total_events,
    COUNT(*) FILTER (WHERE event_type = 'page_view')::INT AS total_page_views,
    COUNT(DISTINCT visitor_id)::INT AS unique_visitors,
    COUNT(DISTINCT session_id)::INT AS unique_sessions
  FROM analytics
  WHERE DATE(occurred_at) BETWEEN p_from AND p_to
  GROUP BY DATE(occurred_at), event_type, path;
END;
$$;

-- ------------------------------------------------------------
-- 4) Data retention helper (privacy + storage control)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION purge_old_analytics(p_retention_days INT DEFAULT 395)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT := 0;
BEGIN
  DELETE FROM analytics
  WHERE occurred_at < NOW() - (p_retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM analytics_sessions
  WHERE last_seen_at < NOW() - (p_retention_days || ' days')::INTERVAL;

  RETURN deleted_count;
END;
$$;

-- ------------------------------------------------------------
-- 5) Tighten RLS for analytics writes (server/service-role only)
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
DROP POLICY IF EXISTS "Admins can view analytics" ON analytics;

CREATE POLICY "Service role can insert analytics"
  ON analytics FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read analytics"
  ON analytics FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update analytics"
  ON analytics FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE IF EXISTS analytics_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics_sessions" ON analytics_sessions;

CREATE POLICY "Service role can manage analytics_sessions"
  ON analytics_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE IF EXISTS analytics_daily_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage analytics_daily_metrics" ON analytics_daily_metrics;

CREATE POLICY "Service role can manage analytics_daily_metrics"
  ON analytics_daily_metrics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
