-- ============================================================
-- MyCaptionAI - Schema Update V9
-- Rich content for ecosystem tool relationships
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

ALTER TABLE ecosystem_tools
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS integration_type TEXT,
  ADD COLUMN IF NOT EXISTS ecosystem_summary TEXT,
  ADD COLUMN IF NOT EXISTS when_to_use TEXT,
  ADD COLUMN IF NOT EXISTS how_to_use TEXT,
  ADD COLUMN IF NOT EXISTS best_for TEXT,
  ADD COLUMN IF NOT EXISTS use_case_examples JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommendation TEXT,
  ADD COLUMN IF NOT EXISTS caveats TEXT,
  ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS content_status TEXT DEFAULT 'active'
    CHECK (content_status IN ('active', 'preview', 'beta', 'sunsetting', 'retired')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_ecosystem_tools_ecosystem_order
  ON ecosystem_tools(ecosystem_id, display_order);

CREATE INDEX IF NOT EXISTS idx_ecosystem_tools_content_status
  ON ecosystem_tools(content_status);

-- Backfill a stable initial order for existing links.
WITH ordered_links AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY ecosystem_id ORDER BY created_at, id) AS row_num
  FROM ecosystem_tools
)
UPDATE ecosystem_tools et
SET display_order = ordered_links.row_num
FROM ordered_links
WHERE et.id = ordered_links.id
  AND COALESCE(et.display_order, 0) = 0;

-- ============================================================
-- DONE
-- ============================================================
