-- ============================================================
-- MyCaptionAI Tools Library — Schema Update v12: Contact Submissions Table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('sponsorship', 'issue', 'collaboration', 'general', 'other')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- optional link to user profile
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (to avoid duplicate errors)
DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;

-- Create Policies
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON public.contact_submissions(subject_type);
