-- ============================================================
-- MyCaptionAI - Schema Update V8 (Tool Submissions)
-- Run this AFTER existing schema updates
-- ============================================================

CREATE TABLE IF NOT EXISTS tool_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  added BOOLEAN NOT NULL DEFAULT FALSE,
  abuse BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_submissions_created_at
  ON tool_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_submissions_added
  ON tool_submissions(added);
CREATE INDEX IF NOT EXISTS idx_tool_submissions_abuse
  ON tool_submissions(abuse);

ALTER TABLE IF EXISTS tool_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can insert tool_submissions" ON tool_submissions;
DROP POLICY IF EXISTS "Service role can read tool_submissions" ON tool_submissions;
DROP POLICY IF EXISTS "Service role can update tool_submissions" ON tool_submissions;
DROP POLICY IF EXISTS "Service role can delete tool_submissions" ON tool_submissions;

CREATE POLICY "Service role can insert tool_submissions"
  ON tool_submissions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read tool_submissions"
  ON tool_submissions FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update tool_submissions"
  ON tool_submissions FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete tool_submissions"
  ON tool_submissions FOR DELETE
  TO service_role
  USING (true);
