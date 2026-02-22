-- ============================================================
-- Seed Blog Post: Gemini 3.1 Pro (from Google Blog source)
-- Requires schema_update_v7_blog_rich_content.sql
-- ============================================================

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  content_format,
  content_blocks,
  canonical_source_url,
  cover_image_url,
  author,
  status,
  is_featured,
  tags,
  seo_title,
  seo_description,
  published_at
)
VALUES (
  'Gemini 3.1 Pro: What Changed and Why It Matters',
  'gemini-3-1-pro-what-changed-and-why-it-matters',
  'Google introduced Gemini 3.1 Pro as a stronger reasoning baseline for harder, real-world tasks. Here is what shipped, where it is available, and what to watch next.',
  'Google announced Gemini 3.1 Pro as an upgraded core model for complex tasks. This post summarizes the release, availability, and practical implications for builders.',
  'blocks',
  '[
    {"type":"paragraph","text":"Google announced Gemini 3.1 Pro on February 19, 2026 as an upgraded baseline model focused on more complex reasoning and problem-solving workflows."},
    {"type":"heading","level":2,"text":"Where It Is Available"},
    {"type":"list","items":[
      "Developers: Gemini API in AI Studio, Gemini CLI, Antigravity, and Android Studio (preview)",
      "Enterprise: Vertex AI and Gemini Enterprise",
      "Consumers: Gemini app and NotebookLM (rollout by plan tier)"
    ]},
    {"type":"heading","level":2,"text":"What Improved"},
    {"type":"paragraph","text":"Google positions 3.1 Pro as a smarter core model for tasks that require synthesis, reasoning over multiple constraints, and clearer outputs for difficult topics."},
    {"type":"paragraph","text":"The release highlights progress on ARC-AGI-2 with a reported verified score of 77.1%, described by Google as more than double Gemini 3 Pro on that benchmark."},
    {"type":"heading","level":2,"text":"Practical Use Cases Mentioned"},
    {"type":"list","items":[
      "Turning prompts into website-ready animated SVG output",
      "Synthesizing telemetry into interactive dashboards",
      "Building interactive 3D and creative coding experiences",
      "Translating narrative themes into functional web interfaces"
    ]},
    {"type":"quote","text":"3.1 Pro is designed for tasks where a simple answer is not enough.","cite":"Google Gemini Team"},
    {"type":"divider"},
    {"type":"cta","title":"Read the official release","text":"For exact product limits, rollout timing, and platform details, check the primary source.","href":"https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/","label":"Open Google Blog"},
    {"type":"embed","url":"https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/","title":"Gemini 3.1 Pro: Official announcement"}
  ]'::jsonb,
  'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/',
  NULL,
  'MyCaptionAI Editorial',
  'published',
  true,
  ARRAY['Google','Gemini','LLM','AI Models','Product Updates'],
  'Gemini 3.1 Pro: Launch Summary, Access, and Use Cases',
  'A concise breakdown of Google Gemini 3.1 Pro: availability, reasoning upgrades, benchmark claim, and implementation-focused takeaways.',
  '2026-02-22T00:00:00Z'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  content_format = EXCLUDED.content_format,
  content_blocks = EXCLUDED.content_blocks,
  canonical_source_url = EXCLUDED.canonical_source_url,
  cover_image_url = EXCLUDED.cover_image_url,
  author = EXCLUDED.author,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  tags = EXCLUDED.tags,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();

