-- ============================================================
-- MyCaptionAI — Schema Update V4
-- Ecosystems & Playbooks
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. ECOSYSTEMS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecosystems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ecosystems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public ecosystems are viewable by everyone" ON ecosystems FOR SELECT USING (true);
CREATE POLICY "Admins can insert ecosystems" ON ecosystems FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update ecosystems" ON ecosystems FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete ecosystems" ON ecosystems FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 2. ECOSYSTEM TOOLS (Junction)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ecosystem_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecosystem_id UUID REFERENCES ecosystems(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  role_category TEXT, -- e.g., 'Official UI', 'Developer SDK'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ecosystem_id, tool_id)
);

ALTER TABLE ecosystem_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public ecosystem_tools are viewable by everyone" ON ecosystem_tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert ecosystem_tools" ON ecosystem_tools FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update ecosystem_tools" ON ecosystem_tools FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete ecosystem_tools" ON ecosystem_tools FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 3. PLAYBOOKS
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  ecosystem_id UUID REFERENCES ecosystems(id) ON DELETE SET NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

-- Note: In the future, we can update the SELECT policy to allow authors to see their unpublished playbooks.
-- For now, public can see published, admins can see all.
CREATE POLICY "Published playbooks are viewable by everyone" ON playbooks FOR SELECT USING (is_published = true OR auth.role() = 'service_role');
CREATE POLICY "Admins can insert playbooks" ON playbooks FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update playbooks" ON playbooks FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete playbooks" ON playbooks FOR DELETE USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────
-- 4. PLAYBOOK TOOLS (Junction)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE NOT NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
  step_order INT NOT NULL DEFAULT 0,
  step_description TEXT, -- Specific instructions for what this tool does in this playbook step
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playbook_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playbook_tools are viewable by everyone" ON playbook_tools FOR SELECT USING (true);
CREATE POLICY "Admins can insert playbook_tools" ON playbook_tools FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Admins can update playbook_tools" ON playbook_tools FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Admins can delete playbook_tools" ON playbook_tools FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================
-- DONE! Tables created and RLS configured.
-- ============================================================
