-- Contact submissions: production RLS remediation
-- Run this once in the Supabase Dashboard SQL Editor for the production project.
-- The application now writes via its server-only service-role client, so public
-- clients do not need direct access to contact submissions.

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service role can manage contact submissions" ON public.contact_submissions;

-- Keep the table private from browser clients. The service_role bypasses RLS.
CREATE POLICY "Service role can manage contact submissions"
  ON public.contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
