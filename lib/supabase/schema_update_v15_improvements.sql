-- ============================================================
-- MyCaptionAI — Schema Update V15 (Platform Improvements)
-- 1) Atomic upvote increment RPC
-- Run this in the Supabase SQL editor.
-- ============================================================

CREATE OR REPLACE FUNCTION increment_tool_upvotes(tool_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE tools
  SET upvotes = COALESCE(upvotes, 0) + 1
  WHERE id = tool_id
  RETURNING upvotes INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;
