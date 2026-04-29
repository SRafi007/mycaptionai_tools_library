-- ============================================================
-- MyCaptionAI - Schema Update V10
-- Rich editorial content for playbooks and playbook steps
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

ALTER TABLE playbooks
  ADD COLUMN IF NOT EXISTS target_user TEXT,
  ADD COLUMN IF NOT EXISTS outcome TEXT,
  ADD COLUMN IF NOT EXISTS difficulty TEXT
    CHECK (difficulty IS NULL OR difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  ADD COLUMN IF NOT EXISTS estimated_time TEXT,
  ADD COLUMN IF NOT EXISTS best_for TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS source_urls TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE playbook_tools
  ADD COLUMN IF NOT EXISTS step_title TEXT,
  ADD COLUMN IF NOT EXISTS step_goal TEXT,
  ADD COLUMN IF NOT EXISTS how_to_use TEXT,
  ADD COLUMN IF NOT EXISTS input_needed TEXT,
  ADD COLUMN IF NOT EXISTS output_expected TEXT,
  ADD COLUMN IF NOT EXISTS why_this_tool TEXT,
  ADD COLUMN IF NOT EXISTS alternatives TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_playbooks_display_order
  ON playbooks(display_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_playbooks_difficulty
  ON playbooks(difficulty);

CREATE INDEX IF NOT EXISTS idx_playbook_tools_step_order
  ON playbook_tools(playbook_id, step_order);

-- Backfill stable order for existing playbooks.
WITH ordered_playbooks AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) AS row_num
  FROM playbooks
)
UPDATE playbooks p
SET display_order = ordered_playbooks.row_num
FROM ordered_playbooks
WHERE p.id = ordered_playbooks.id
  AND COALESCE(p.display_order, 0) = 0;

-- ============================================================
-- DONE
-- ============================================================
