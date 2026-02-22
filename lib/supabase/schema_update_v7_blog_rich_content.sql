-- ============================================================
-- MyCaptionAI - Schema Update V7 (Rich Blog Content)
-- Run this AFTER existing schema updates
-- ============================================================

ALTER TABLE IF EXISTS blog_posts
  ADD COLUMN IF NOT EXISTS content_format TEXT NOT NULL DEFAULT 'markdown'
    CHECK (content_format IN ('markdown', 'blocks')),
  ADD COLUMN IF NOT EXISTS content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_source_url TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_content_format ON blog_posts(content_format);

