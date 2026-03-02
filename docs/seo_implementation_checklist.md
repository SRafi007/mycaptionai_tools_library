# SEO Implementation Checklist (Dynamic Pages)

Date: 2026-03-03
Scope: Dynamic SEO for `/tools/[slug]`, `/blog/[slug]`, category/listing surfaces, and supporting technical SEO.

## P0 (Critical, Immediate)

### 1. Canonical/indexation policy for syndicated blog posts
- [x] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Set `robots` to `noindex,follow` when `canonical_source_url` exists.
- [x] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Keep canonical URL logic for original vs syndicated posts.
- [x] [app/sitemap.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemap.ts): Exclude syndicated posts from XML sitemap with `.is("canonical_source_url", null)`.

### 2. Active-only tool indexation and crawl hygiene
- [x] [lib/db/tools.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/lib/db/tools.ts): Add `status = active` filter to all public tool retrieval/search/count functions.
- [x] [app/sitemap.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemap.ts): Include only active tools in tool URL entries.
- [x] [lib/db/tools.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/lib/db/tools.ts): Restrict `getAllToolSlugs()` to active tools so static params only cover indexable pages.

### 3. Dynamic title consistency with global template
- [x] [app/tools/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/tools/%5Bslug%5D/page.tsx): Remove hardcoded site brand from per-page title to avoid duplication with layout template.
- [x] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Use brand-neutral fallback title for the same reason.

## P1 (High Impact, Next Sprint)

### 1. Dynamic page image and CWV improvements
- [ ] [app/tools/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/tools/%5Bslug%5D/page.tsx): Convert hero/detail images to `next/image` with explicit dimensions.
- [ ] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Convert cover and content block images to optimized image component strategy.
- [ ] [app/blog/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/page.tsx): Optimize listing thumbnails for LCP and CLS.
- [ ] [next.config.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/next.config.ts): Add image `remotePatterns` for external blog/tool media hosts.

### 2. Metadata depth for tool and blog detail pages
- [ ] [app/tools/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/tools/%5Bslug%5D/page.tsx): Add richer Open Graph image metadata (`url`, `width`, `height`, `alt`) and `authors/publisher` where applicable.
- [ ] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Add optional `article:modified_time` parity via metadata fields and validate schema alignment with visible content.

### 3. Structured internal link modules for dynamic pages
- [ ] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Add related posts block with contextual internal links.
- [ ] [app/tools/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/tools/%5Bslug%5D/page.tsx): Expand similar tools module with intent-based anchor text coverage.

## P2 (Scale and Operations)

### 1. Sitemap scalability and segmentation
- [x] [app/sitemap.xml/route.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemap.xml/route.ts): Added sitemap index route that lists segmented sitemap files.
- [x] [app/sitemaps/tools.xml/route.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemaps/tools.xml/route.ts): Added tools sitemap route.
- [x] [app/sitemaps/categories.xml/route.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemaps/categories.xml/route.ts): Added categories sitemap route.
- [x] [app/sitemaps/blog.xml/route.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemaps/blog.xml/route.ts): Added blog sitemap route (published + non-syndicated).
- [x] [app/sitemaps/use-cases.xml/route.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/sitemaps/use-cases.xml/route.ts): Added use-case/core sitemap route.
- [x] [app/robots.ts](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/robots.ts): Updated robots sitemap list to include sitemap index + segmented routes.

### 2. Editorial trust and freshness signals
- [ ] [app/about/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/about/page.tsx): Add explicit editorial/testing policy link targets.
- [ ] [app/blog/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/blog/%5Bslug%5D/page.tsx): Add reviewer/byline and visible last-reviewed pattern for trust.
- [ ] [app/category/[slug]/page.tsx](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/app/category/%5Bslug%5D/page.tsx): Add stronger freshness/test methodology blocks per high-priority categories.

### 3. Monitoring and QA process
- [ ] [docs/seo_strategy.md](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/docs/seo_strategy.md): Add weekly SEO QA checklist for canonical conflicts, noindex drift, and sitemap integrity.
- [x] [scripts/seoQaCheck.mjs](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/scripts/seoQaCheck.mjs): Added SEO QA validator for canonical/noindex/sitemap consistency.
- [x] [.github/workflows/seo-qa.yml](d:/My%20sites/Mycaptionai/mycaption_ai_tools_platform/mycaptionai_library/.github/workflows/seo-qa.yml): Added CI workflow to run SEO QA automatically.
