-- ============================================================
-- MyCaptionAI - Schema Update V4
-- New source-ready columns + ingestion metadata
-- Run this AFTER schema.sql / existing updates
-- ============================================================

-- ------------------------------------------------------------
-- 1) tools table: preserve raw pricing + normalized URL + quality
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS tools
  ADD COLUMN IF NOT EXISTS pricing_label_raw TEXT,
  ADD COLUMN IF NOT EXISTS starting_price_text TEXT,
  ADD COLUMN IF NOT EXISTS currency_code TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS quality_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_description_noisy BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_quality_score_range_ck'
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_quality_score_range_ck
      CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tools_canonical_url ON tools(canonical_url);
CREATE INDEX IF NOT EXISTS idx_tools_last_seen_at ON tools(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_quality_score ON tools(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_tools_source_name ON tools(source);

-- ------------------------------------------------------------
-- 2) scraped_tools table: keep raw payload + ingestion batch metadata
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS scraped_tools
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS source_name TEXT DEFAULT 'futurepedia',
  ADD COLUMN IF NOT EXISTS source_raw JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ingestion_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS ingested_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_scraped_tools_source_name ON scraped_tools(source_name);
CREATE INDEX IF NOT EXISTS idx_scraped_tools_ingestion_batch_id ON scraped_tools(ingestion_batch_id);
CREATE INDEX IF NOT EXISTS idx_scraped_tools_slug ON scraped_tools(slug);

-- ------------------------------------------------------------
-- 3) Notes
-- featured_tools/trending_tools/trending_categories stay unchanged
-- ------------------------------------------------------------
