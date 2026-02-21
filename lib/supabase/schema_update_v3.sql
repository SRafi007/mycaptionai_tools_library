-- ============================================================
-- MyCaptionAI — Schema Update V3
-- Separate Tables for Featured & Trending Tools/Categories
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. FEATURED TOOLS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS featured_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE featured_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public featured_tools are viewable by everyone" ON featured_tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert featured_tools" ON featured_tools FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update featured_tools" ON featured_tools FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete featured_tools" ON featured_tools FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 2. TRENDING TOOLS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trending_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trending_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trending_tools are viewable by everyone" ON trending_tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert trending_tools" ON trending_tools FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update trending_tools" ON trending_tools FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete trending_tools" ON trending_tools FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 3. TRENDING CATEGORIES
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trending_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trending_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public trending_categories are viewable by everyone" ON trending_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert trending_categories" ON trending_categories FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update trending_categories" ON trending_categories FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete trending_categories" ON trending_categories FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 4. MIGRATE EXISTING DATA
-- ────────────────────────────────────────────────
-- Migrate featured tools
INSERT INTO featured_tools (tool_id, display_order)
SELECT id, ROW_NUMBER() OVER (ORDER BY rating_score DESC)
FROM tools
WHERE is_featured = true
ON CONFLICT (tool_id) DO NOTHING;

-- Migrate trending categories (we don't have is_trending on categories, but we can take top 10 by tool_count)
INSERT INTO trending_categories (category_id, display_order)
SELECT id, ROW_NUMBER() OVER (ORDER BY tool_count DESC)
FROM categories
LIMIT 10
ON CONFLICT (category_id) DO NOTHING;

-- Migrate trending tools (we don't have is_trending on tools, so we take top 10 by upvotes)
INSERT INTO trending_tools (tool_id, display_order)
SELECT id, ROW_NUMBER() OVER (ORDER BY upvotes DESC)
FROM tools
LIMIT 10
ON CONFLICT (tool_id) DO NOTHING;

-- ============================================================
-- DONE! Tables created and RLS configured. Data migrated.
-- ============================================================
