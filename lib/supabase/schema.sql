-- ============================================================
-- MyCaptionAI Tools Library — Full Database Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- STEP 1: Create scraped_tools backup table
-- ============================================================
CREATE TABLE IF NOT EXISTS scraped_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  slug TEXT,
  short_description TEXT,
  official_url TEXT,
  image_url TEXT,
  icon_url TEXT,
  pricing_label TEXT,
  categories JSONB,
  upvotes INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  rating_score FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  application_category TEXT,
  publisher TEXT,
  category_rank INT,
  ranking_category TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  scraped_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraped_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on scraped_tools"
  ON scraped_tools FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 2: Drop old production tables (cascade removes FKs)
-- ============================================================
DROP TABLE IF EXISTS search_logs CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS tool_tags CASCADE;
DROP TABLE IF EXISTS tool_categories CASCADE;
DROP TABLE IF EXISTS tools CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS collection_tools CASCADE;

-- Drop old enum types
DROP TYPE IF EXISTS pricing_enum CASCADE;
DROP TYPE IF EXISTS tool_status_enum CASCADE;

-- ============================================================
-- STEP 3: Create new production schema
-- ============================================================

-- ENUM TYPES
CREATE TYPE pricing_enum AS ENUM ('Free', 'Freemium', 'Paid', 'Free-Trial', 'Contact');
CREATE TYPE tool_status_enum AS ENUM ('active', 'pending', 'archived');

-- CATEGORIES (hierarchical with parent_id)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  tool_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TAGS
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOOLS (enriched)
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  long_description TEXT,
  url TEXT NOT NULL,
  affiliate_url TEXT,
  image_url TEXT,
  icon_url TEXT,
  pricing_type pricing_enum DEFAULT 'Free',
  starting_price NUMERIC,
  has_free_trial BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  status tool_status_enum DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsored_rank INT DEFAULT 0,
  priority_score FLOAT DEFAULT 0,
  upvotes INT DEFAULT 0,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  rating_score FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  publisher TEXT,
  launch_year INT,
  country TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  pros_cons JSONB DEFAULT '{}'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  search_vector TSVECTOR,
  source TEXT,
  source_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOIN TABLES
CREATE TABLE tool_categories (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE tool_tags (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (tool_id, tag_id)
);

-- COLLECTIONS (curated groups)
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collection_tools (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (collection_id, tool_id)
);

-- ANALYTICS
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  tool_id UUID REFERENCES tools(id),
  query TEXT,
  path TEXT,
  referer TEXT,
  device_type TEXT,
  country TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEARCH LOGS
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INT,
  clicked_tool_id UUID REFERENCES tools(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STEP 4: Indexes
-- ============================================================
CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_pricing ON tools(pricing_type);
CREATE INDEX idx_tools_featured ON tools(is_featured);
CREATE INDEX idx_tools_sponsored ON tools(is_sponsored);
CREATE INDEX idx_tools_priority ON tools(priority_score DESC);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_upvotes ON tools(upvotes DESC);
CREATE INDEX idx_tools_rating ON tools(rating_score DESC);

CREATE INDEX idx_tools_search_vector ON tools USING GIN (search_vector);
-- NOTE: ivfflat index on embedding needs data first; create after migration

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_featured ON categories(is_featured);

CREATE INDEX idx_tags_slug ON tags(slug);

CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_published ON collections(is_published);

CREATE INDEX idx_analytics_event ON analytics(event_type);
CREATE INDEX idx_analytics_tool ON analytics(tool_id);
CREATE INDEX idx_analytics_created ON analytics(created_at);

-- ============================================================
-- STEP 5: Row Level Security
-- ============================================================

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (auth.role() = 'service_role');

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON tags FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update tags" ON tags FOR UPDATE USING (auth.role() = 'service_role');

-- Tools
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public tools are viewable by everyone" ON tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert tools" ON tools FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update tools" ON tools FOR UPDATE USING (auth.role() = 'service_role');

-- Tool Categories
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public tool_categories are viewable by everyone" ON tool_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert tool_categories" ON tool_categories FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Tool Tags
ALTER TABLE tool_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public tool_tags are viewable by everyone" ON tool_tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tool_tags" ON tool_tags FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public collections are viewable by everyone" ON collections FOR SELECT USING (true);
CREATE POLICY "Admins can insert collections" ON collections FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update collections" ON collections FOR UPDATE USING (auth.role() = 'service_role');

-- Collection Tools
ALTER TABLE collection_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public collection_tools are viewable by everyone" ON collection_tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert collection_tools" ON collection_tools FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Analytics
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON analytics FOR SELECT USING (auth.role() = 'service_role');

-- Search Logs
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert search_logs" ON search_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view search_logs" ON search_logs FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================
-- DONE! Now run: npx tsx scripts/seedScrapedTools.ts
-- ============================================================
