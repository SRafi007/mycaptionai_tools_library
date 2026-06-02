-- ============================================================
-- MyCaptionAI Tools Library — Schema Update v11: User Authentication & Personalization
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Create user_profiles table extending auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  website_url TEXT,
  twitter_handle TEXT,
  role TEXT DEFAULT 'user',      -- 'user' | 'admin' | 'moderator'
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create user_bookmarks table (future bookmarking system)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,      -- 'tool' | 'playbook' | 'social_post'
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- 3. Create user_tool_ratings table (future ratings/reviews)
CREATE TABLE IF NOT EXISTS public.user_tool_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tool_ratings ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies

-- user_profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- user_bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON public.user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON public.user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- user_tool_ratings policies
CREATE POLICY "Ratings are viewable by everyone" ON public.user_tool_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tool ratings" ON public.user_tool_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool ratings" ON public.user_tool_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tool ratings" ON public.user_tool_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Trigger to automatically create user profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    LOWER(REGEXP_REPLACE(split_part(new.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '_' || FLOOR(RANDOM() * 1000)::TEXT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (drop first to prevent duplicate trigger errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_entity ON public.user_bookmarks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_ratings_user ON public.user_tool_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_ratings_tool ON public.user_tool_ratings(tool_id);
