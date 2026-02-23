# SEO Category Map and Prioritized Backlog
Date: February 23, 2026  
Source: Live `categories` table (`name`, `slug`, `tool_count`) from Supabase.

## Objective
Turn existing category coverage into a focused SEO production backlog that grows organic traffic fastest.

## Category Inventory (Mapped to Current Site)
Primary URL pattern in your app: `/category/[slug]`

## Tier A: Highest Scale Categories (`tool_count >= 80`)
1. `marketing` (204)
2. `education` (166)
3. `personal-assistant` (139)
4. `ai-agents` (128)
5. `ai-chatbots` (125)
6. `research` (117)
7. `social-media` (115)
8. `design-generators` (110)
9. `workflows` (98)
10. `video-generators` (96)
11. `customer-support` (93)
12. `image-generators` (90)
13. `e-commerce` (86)
14. `image-editing` (81)

## Tier B: High Opportunity Categories (`50-79`)
1. `writing-generators` (74)
2. `video-editing` (72)
3. `sales-assistant` (66)
4. `low-code-no-code` (63)
5. `startup-tools` (62)
6. `finance` (59)
7. `project-management` (55)
8. `summarizer` (53)
9. `code-assistant` (53)
10. `seo` (51)

## Tier C: Mid-Tail Categories (`25-49`)
1. `text-to-video` (44)
2. `human-resources` (43)
3. `legal` (40)
4. `health` (40)
5. `text-to-speech` (39)
6. `transcriber` (39)
7. `copywriting` (38)
8. `students` (37)
9. `website-builders` (37)
10. `audio-editing` (36)
11. `fun-tools` (33)
12. `music` (32)
13. `ai-detection` (30)
14. `email-assistant` (30)
15. `real-estate` (29)
16. `presentations` (28)
17. `translator` (28)
18. `text-to-image` (27)
19. `avatars` (27)
20. `gaming` (25)

## Tier D: Long Tail (`<=24`)
Includes: `spreadsheets`, `3d`, `search-engine`, `stock-trading`, `teachers`, `video-enhancer`, `portrait-generators`, `storyteller`, `paraphrasing`, `travel`, `prompt-generators`, `fitness`, `logo-generator`, `fashion`, `gift-ideas`, `sql`, `religion`, `cartoon-generators`.

## Prioritization Logic
Priority score is based on:
1. Category inventory size (`tool_count`).
2. Commercial intent potential (buyer/decision keywords).
3. SERP competitiveness vs directory players.
4. Internal monetization fit (outbound clicks, affiliate/sponsored potential).

Expected traffic impact labels:
1. `Very High`: likely strongest click growth if executed well.
2. `High`
3. `Medium`
4. `Low`

## Prioritized Page Backlog (By Expected Traffic Impact)
## P0: Ship First (Very High Impact)
1. Upgrade `/category/marketing` into a full hub: tested picks, free-vs-paid, use-case sections.
2. Upgrade `/category/ai-agents` with comparison matrix + alternatives module.
3. Upgrade `/category/ai-chatbots` with persona splits (support, sales, internal ops).
4. Upgrade `/category/social-media` with platform-specific sections (X, LinkedIn, YouTube, TikTok).
5. Upgrade `/category/video-generators` with workflow-based picks (script-to-video, avatar, shorts).
6. Upgrade `/category/image-generators` with model/style comparison blocks.
7. Upgrade `/category/e-commerce` with conversion-focused picks (product page, ads, CRO).
8. Upgrade `/category/customer-support` with SaaS/helpdesk integration-based picks.
9. Publish `/best/free-marketing-ai-tools` mapped to `marketing`, `copywriting`, `seo`.
10. Publish `/best/ai-agents-for-startups` mapped to `ai-agents`, `startup-tools`, `workflows`.
11. Publish `/best/ai-chatbots-for-customer-support` mapped to `ai-chatbots`, `customer-support`.
12. Publish `/best/ai-tools-for-ecommerce-growth` mapped to `e-commerce`, `marketing`, `sales-assistant`.

## P1: Next Wave (High Impact)
1. Upgrade `/category/education`.
2. Upgrade `/category/personal-assistant`.
3. Upgrade `/category/research`.
4. Upgrade `/category/design-generators`.
5. Upgrade `/category/workflows`.
6. Upgrade `/category/image-editing`.
7. Upgrade `/category/writing-generators`.
8. Upgrade `/category/video-editing`.
9. Upgrade `/category/sales-assistant`.
10. Upgrade `/category/low-code-no-code`.
11. Upgrade `/category/code-assistant`.
12. Upgrade `/category/seo`.
13. Publish `/best/free-seo-ai-tools` mapped to `seo`, `marketing`.
14. Publish `/best/ai-tools-for-content-teams` mapped to `writing-generators`, `summarizer`, `copywriting`.
15. Publish `/best/ai-video-tools-for-creators` mapped to `video-generators`, `video-editing`, `text-to-video`.
16. Publish `/best/ai-image-tools-for-designers` mapped to `image-generators`, `image-editing`, `design-generators`.

## P2: Expansion (Medium Impact)
1. Upgrade `/category/finance`.
2. Upgrade `/category/project-management`.
3. Upgrade `/category/summarizer`.
4. Upgrade `/category/text-to-video`.
5. Upgrade `/category/website-builders`.
6. Upgrade `/category/email-assistant`.
7. Upgrade `/category/text-to-speech`.
8. Upgrade `/category/transcriber`.
9. Upgrade `/category/translator`.
10. Upgrade `/category/presentations`.
11. Publish `/best/ai-tools-for-students` mapped to `students`, `education`, `summarizer`, `transcriber`.
12. Publish `/best/ai-tools-for-teachers` mapped to `teachers`, `education`, `presentations`.
13. Publish `/best/ai-tools-for-recruiters` mapped to `human-resources`, `research`.
14. Publish `/best/free-ai-coding-tools` mapped to `code-assistant`, `low-code-no-code`, `sql`.

## P3: Long-Tail Capture (Medium to Low Impact)
1. Upgrade `/category/legal`.
2. Upgrade `/category/health`.
3. Upgrade `/category/real-estate`.
4. Upgrade `/category/music`.
5. Upgrade `/category/avatars`.
6. Upgrade `/category/gaming`.
7. Publish `/best/ai-tools-for-real-estate-leads` mapped to `real-estate`, `marketing`.
8. Publish `/best/ai-tools-for-health-workflows` mapped to `health`, `research`.
9. Publish `/best/ai-tools-for-legal-drafting` mapped to `legal`, `summarizer`.
10. Publish `/best/ai-tools-for-music-production` mapped to `music`, `audio-editing`.

## URL and Template Recommendations
Use consistent page types so production scales cleanly:

1. Category hub pages: `/category/[slug]` (already exists, enrich heavily).
2. Use-case pages: `/best/[usecase]` (already supported by `app/best/[usecase]/page.tsx`).
3. Alternatives pages: `/tools/[tool-slug]/alternatives` for only top tools in Tier A/B categories.

## Minimum Content Spec Per New/Upgraded Page
1. 120-180 word expert intro with intent match.
2. "How we tested" block.
3. Ranked list with unique test data fields.
4. Free option section.
5. Alternatives/related categories internal links.
6. FAQ block answering real query variations.
7. Freshness signals: last tested + last updated.

## 12-Week Production Targets
1. Week 1-4: Complete all P0 (12 items).
2. Week 5-8: Complete first 10 items of P1.
3. Week 9-12: Complete remaining P1 + first 6 items of P2.

## KPI Targets by Backlog Group
1. P0 pages:
- Primary KPI: non-brand clicks
- Target: fastest traffic gains and CTR lift

2. P1 pages:
- Primary KPI: ranking footprint expansion in mid/high-volume intents
- Target: sustained click growth after P0

3. P2/P3 pages:
- Primary KPI: long-tail query coverage and assisted conversions
- Target: compounding traffic depth

## Implementation Note
For category pages already live, this backlog means "upgrade quality and structure," not create duplicate URLs.  
For `/best/*` pages, only publish where there is unique category-mapped value and enough tool depth.
