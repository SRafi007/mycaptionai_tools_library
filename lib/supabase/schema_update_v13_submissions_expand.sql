-- ============================================================
-- MyCaptionAI Tools Library — Schema Update v13: Expand Tool Submissions Table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE public.tool_submissions 
  ADD COLUMN IF NOT EXISTS submitted_by TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship_to_company TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS company_contact TEXT;
