-- ============================================================
-- MyCaptionAI — Schema Update V14 (Analytics Overhaul)
-- Replaces the per-event analytics table with a 4-table
-- visitor + batched activity log model.
--
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0) Drop old analytics infrastructure
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS refresh_analytics_daily_metrics(DATE, DATE);
DROP FUNCTION IF EXISTS purge_old_analytics(INT);
DROP TABLE IF EXISTS analytics_daily_metrics CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1) visitors — one row per unique visitor
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id      TEXT NOT NULL UNIQUE,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_sessions  INT NOT NULL DEFAULT 1,
  total_pageviews INT NOT NULL DEFAULT 0,
  user_agent_hash TEXT,
  ip_hash         TEXT,
  device_type     TEXT,
  language        TEXT,
  timezone        TEXT,
  screen          TEXT,
  country_code    TEXT,
  region          TEXT,
  city            TEXT,
  first_referrer       TEXT,
  first_referrer_host  TEXT,
  first_utm_source     TEXT,
  first_utm_medium     TEXT,
  first_utm_campaign   TEXT,
  first_landing_page   TEXT,
  is_bot          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen  ON visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitors_country    ON visitors(country_code);
CREATE INDEX IF NOT EXISTS idx_visitors_device     ON visitors(device_type);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON visitors(first_seen_at DESC);

-- ────────────────────────────────────────────────────────────
-- 2) activity_logs — one row per session flush
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id      TEXT NOT NULL REFERENCES visitors(visitor_id),
  session_id      UUID NOT NULL,
  landing_page    TEXT,
  exit_page       TEXT,
  referrer        TEXT,
  referrer_host   TEXT,
  activities      JSONB NOT NULL DEFAULT '[]',
  activity_count  INT NOT NULL DEFAULT 0,
  page_view_count INT NOT NULL DEFAULT 0,
  session_start   TIMESTAMPTZ,
  session_end     TIMESTAMPTZ,
  duration_ms     INT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  utm_term        TEXT,
  utm_content     TEXT,
  is_bot          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_al_visitor    ON activity_logs(visitor_id);
CREATE INDEX IF NOT EXISTS idx_al_session    ON activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_al_created    ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_landing    ON activity_logs(landing_page, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_al_activities ON activity_logs USING GIN(activities);

-- ────────────────────────────────────────────────────────────
-- 3) page_stats — per-page aggregates (auto-updated by trigger)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_stats (
  path              TEXT PRIMARY KEY,
  total_views       INT NOT NULL DEFAULT 0,
  total_clicks      INT NOT NULL DEFAULT 0,
  unique_visitors   INT NOT NULL DEFAULT 0,
  first_viewed_at   TIMESTAMPTZ,
  last_viewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_stats_views ON page_stats(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_page_stats_last  ON page_stats(last_viewed_at DESC);

-- ────────────────────────────────────────────────────────────
-- 4) search_queries — first-class search query log
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_queries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id      TEXT,
  session_id      UUID,
  query           TEXT NOT NULL,
  path            TEXT,
  results_count   INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sq_query   ON search_queries(query);
CREATE INDEX IF NOT EXISTS idx_sq_created ON search_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sq_visitor ON search_queries(visitor_id);

-- ────────────────────────────────────────────────────────────
-- 5) Trigger: auto-update page_stats from activity_logs
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_page_stats_from_activity()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  activity JSONB;
  act_path TEXT;
  act_type TEXT;
BEGIN
  FOR activity IN SELECT * FROM jsonb_array_elements(NEW.activities)
  LOOP
    act_path := activity->>'p';
    act_type := activity->>'t';

    IF act_path IS NOT NULL AND act_type = 'pv' THEN
      INSERT INTO page_stats (path, total_views, first_viewed_at, last_viewed_at, updated_at)
      VALUES (act_path, 1, NOW(), NOW(), NOW())
      ON CONFLICT (path) DO UPDATE SET
        total_views    = page_stats.total_views + 1,
        last_viewed_at = NOW(),
        updated_at     = NOW();
    END IF;

    IF act_path IS NOT NULL AND act_type = 'ck' THEN
      INSERT INTO page_stats (path, total_clicks, first_viewed_at, last_viewed_at, updated_at)
      VALUES (act_path, 0, NOW(), NOW(), NOW())
      ON CONFLICT (path) DO UPDATE SET
        total_clicks = page_stats.total_clicks + 1,
        updated_at   = NOW();
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_page_stats ON activity_logs;

CREATE TRIGGER trg_update_page_stats
  AFTER INSERT ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_page_stats_from_activity();

-- ────────────────────────────────────────────────────────────
-- 6) Data retention helper
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION purge_old_activity_data(p_retention_days INT DEFAULT 395)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE deleted INT := 0;
BEGIN
  DELETE FROM search_queries
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;

  DELETE FROM activity_logs
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted = ROW_COUNT;

  DELETE FROM visitors
  WHERE last_seen_at < NOW() - (p_retention_days || ' days')::INTERVAL
    AND visitor_id NOT IN (SELECT DISTINCT visitor_id FROM activity_logs);

  RETURN deleted;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- 7) RLS — service_role only for all 4 tables
-- ────────────────────────────────────────────────────────────
ALTER TABLE visitors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_stats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "srv_visitors"       ON visitors;
DROP POLICY IF EXISTS "srv_activity_logs"  ON activity_logs;
DROP POLICY IF EXISTS "srv_page_stats"     ON page_stats;
DROP POLICY IF EXISTS "srv_search_queries" ON search_queries;

CREATE POLICY "srv_visitors"
  ON visitors FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "srv_activity_logs"
  ON activity_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "srv_page_stats"
  ON page_stats FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "srv_search_queries"
  ON search_queries FOR ALL TO service_role
  USING (true) WITH CHECK (true);
