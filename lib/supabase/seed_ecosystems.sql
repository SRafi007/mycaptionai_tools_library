-- ============================================================
-- MyCaptionAI — Seed Data for AI Giant Ecosystems
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

INSERT INTO ecosystems (name, slug, description, icon_url)
VALUES 
  (
    'OpenAI', 
    'openai', 
    'The massive ecosystem built around the GPT-5.x series (including GPT-5.4 Pro and Thinking models). Discover the top UI clients, prompt tools, and integration frameworks.', 
    'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg'
  ),
  (
    'Anthropic (Claude)', 
    'anthropic', 
    'The ecosystem built around the Claude 4.6 and 5 families (Opus 4.6, Sonnet 5 Fennec). Recognized as the leading choice for heavy coding, intricate writing, and agentic collaborative stacks.', 
    'https://upload.wikimedia.org/wikipedia/commons/c/cc/Anthropic_logo.svg'
  ),
  (
    'Google Gemini', 
    'google-gemini', 
    'The ecosystem built around Gemini 3 Pro and Gemini 3.1 Flash. Leverage massive context windows, Deep Think capabilities, and deep Google Workspace integrations.', 
    'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg'
  ),
  (
    'Open Source (Llama / Mistral)', 
    'open-source', 
    'The local and open-weights ecosystem powered by Meta''s Llama, Mistral, and others. Discover the best local runners and privacy-focused wrappers.', 
    'https://cdn.iconscout.com/icon/free/png-256/free-open-source-icon-download-in-svg-png-gif-file-formats--coding-programming-web-development-pack-logos-icons-2260786.png?f=webp&w=256'
  )
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url;
