-- ============================================================
-- MyCaptionAI — Search, Blog & Settings Schema Update
-- Run this AFTER the main schema in Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. SEARCH: Populate search_vector + auto-update trigger
-- ────────────────────────────────────────────────

UPDATE tools SET search_vector =
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(short_description, '') || ' ' ||
    coalesce(long_description, '') || ' ' ||
    coalesce(publisher, '')
  );

CREATE OR REPLACE FUNCTION tools_search_vector_trigger() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.short_description, '') || ' ' ||
    coalesce(NEW.long_description, '') || ' ' ||
    coalesce(NEW.publisher, '')
  );
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tools_search_vector_update ON tools;
CREATE TRIGGER tools_search_vector_update
  BEFORE INSERT OR UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION tools_search_vector_trigger();

-- ────────────────────────────────────────────────
-- 2. BLOG: blog_posts table
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  author TEXT DEFAULT 'MyCaptionAI',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: only published posts visible
CREATE POLICY "Published posts are public"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR auth.role() = 'service_role');

-- Admins: full CRUD
CREATE POLICY "Admins full access on blog"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 3. SITE SETTINGS: key-value config
-- ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site_settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('hero_title', '"Discover {count}+ AI Tools"'),
  ('hero_subtitle', '"Find the perfect AI tool for any task. Curated, rated, and ranked for creators, marketers, and developers."'),
  ('hero_label', '"AI Tools Directory"'),
  ('featured_count', '6'),
  ('trending_count', '6'),
  ('tools_per_page', '24'),
  ('site_name', '"MyCaptionAI"'),
  ('site_description', '"The AI tools directory built for creators, marketers, and developers."'),
  ('announcement_bar', '{"enabled": false, "text": "", "link": "", "bg_color": "#6366F1"}'),
  ('footer_tagline', '"The AI tools directory built for creators, marketers, and developers. Discover, compare, and choose the right AI tool for any task."')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE! All tables created and seeded.
-- ============================================================
