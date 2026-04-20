# Agent Maintenance Architecture

## Purpose

Build a simple Python-based maintenance system, in a separate repo, that keeps the MyCaptionAI directory complete, fresh, and trustworthy.

The primary goal is:

1. Keep the `tools` catalog accurate and usable.
2. Fill safe missing data where the site depends on it.
3. Discover and add new relevant tools.
4. Refresh curated surfaces like `trending_tools` and `trending_categories`.
5. Generate review lists for stale, weak, duplicate, or low-value tools instead of deleting automatically.

This should stay script-based, not a large orchestration platform.

## Current System Reality

The current app is a Next.js frontend on top of Supabase.

Important content tables already in use:

| Table | Purpose |
| --- | --- |
| `tools` | Main tool records used across search, category pages, detail pages, rankings |
| `categories` | Category records |
| `tool_categories` | Tool-category join table |
| `featured_tools` | Curated homepage/app featured list |
| `trending_tools` | Curated homepage trending list by `display_order` |
| `trending_categories` | Curated homepage category list by `display_order` |
| `tool_submissions` | User-submitted tool suggestions |
| `analytics` | Behavior/events that can feed popularity decisions |
| `site_settings` | Small control settings like counts |
| `ecosystems`, `ecosystem_tools` | Platform/provider grouping |
| `playbooks`, `playbook_tools` | Workflow content built on tools |

## Live Audit Snapshot

Read-only audit taken from the live Supabase project on April 20, 2026.

### Table counts

| Table | Count |
| --- | --- |
| `tools` | 1357 |
| `categories` | 62 |
| `trending_tools` | 7 |
| `featured_tools` | 6 |
| `trending_categories` | 7 |
| `ecosystems` | 4 |
| `ecosystem_tools` | 5 |
| `playbooks` | 1 |
| `playbook_tools` | 3 |
| `tool_submissions` | 12 |
| `site_settings` | 10 |
| `analytics` | 7606 |

### Tool data quality gaps

| Check | Count |
| --- | --- |
| Missing `publisher` | 1295 |
| Missing `icon_url` | 61 |
| Missing `image_url` | 62 |
| Missing `source` | 1 |
| `upvotes = 0` | 675 |
| `rating_score = 0` | 676 |
| `rating_count = 0` | 1357 |
| Empty `features` | 1296 |
| Empty `use_cases` | 1296 |
| Empty `social_links` | 1357 |
| Missing `launch_year` | 1345 |
| Missing `country` | 1296 |
| Active tools with no category link | 607 |

### Immediate conclusions

1. The biggest problem is not descriptions. It is structured metadata completeness.
2. `rating_count` is zero for every tool, so ratings are currently weak as a trust signal.
3. `trending_tools` and `trending_categories` are under-filled relative to the homepage usage.
4. More than 600 active tools are not linked to any category, which hurts browse, SEO, and discovery.
5. The system needs a maintenance loop, not just one-time backfills.

## Where Ranking Logic Depends On Data

The site already uses these fields heavily:

1. Category pages sort by `rating_score`, `upvotes`, or `created_at`.
2. Best-use-case pages rank tools by `rating_score` first, then `upvotes`.
3. Homepage trending uses `trending_tools.display_order`, not an automatic query.
4. Homepage category rail uses `trending_categories.display_order`.

This means the maintenance agents must treat:

1. `rating_score`
2. `rating_count`
3. `upvotes`
4. category links
5. `trending_tools`

as first-class maintenance targets.

## Schema Drift Risk

There is old script logic in `scripts/migrateToProduction.ts` that writes fields like:

1. `canonical_url`
2. `pricing_label_raw`
3. `starting_price_text`
4. `currency_code`
5. `last_seen_at`
6. `is_description_noisy`
7. `quality_score`

Those fields do not appear in the current main `tools` schema file.

Implication:

The new Python maintenance repo must treat the live database schema as the source of truth and should not reuse stale migration assumptions blindly.

## Primary Agent Goal

The agent system should maintain a high-quality tool directory with human-review safety.

More specifically:

1. Enrich missing fields that improve UX, SEO, ranking, and filtering.
2. Detect and insert genuinely useful new tools.
3. Refresh trending/curated lists based on evidence.
4. Flag questionable or outdated tools for review.
5. Never auto-delete records without an explicit review step.

## Recommended Agent Set

Keep this simple. Use one scheduler/orchestrator plus a few task-specific workers.

### 1. Audit Agent

Goal:
Produce health reports about missing fields, broken links, category coverage, duplicate risk, and stale content.

Reads:

1. `tools`
2. `tool_categories`
3. `categories`
4. `analytics`
5. `search_logs`
6. `tool_submissions`

Writes:

1. local JSON/CSV reports
2. optional review tables later

### 2. Enrichment Agent

Goal:
Fill missing metadata for existing tools using web research and controlled synthetic scoring.

Allowed evidence-backed updates:

1. `publisher`
2. `icon_url`
3. `image_url`
4. `features`
5. `use_cases`
6. `social_links`
7. `launch_year`
8. `country`
9. `source`
10. category suggestions

Allowed synthetic updates:

1. `upvotes`
2. `rating_score`
3. `rating_count`

### 3. Discovery Agent

Goal:
Find new tools worth adding, especially from:

1. `tool_submissions`
2. Google-grounded searches
3. ecosystem/provider searches
4. category gap searches

Outputs:

1. proposed new tool records
2. required category links
3. evidence summary
4. insert-ready payloads

### 4. Trending Refresh Agent

Goal:
Refresh `trending_tools` and `trending_categories`.

Inputs:

1. DB popularity signals
2. recent analytics
3. current upvotes
4. external search visibility / mention signals
5. optional manual pin/ban list

Writes:

1. `trending_tools`
2. `trending_categories`

### 5. Retirement Review Agent

Goal:
Find tools that are probably no longer worth keeping.

This agent should not delete.

It should create a review list with reasons such as:

1. dead official site
2. acquired and product shut down
3. duplicate listing
4. tool has no category, no traffic, no rating, no upvotes, and weak search presence
5. obsolete wrapper with no real usage
6. spam / scam / abuse signals

## What Each Agent Should Actually Decide

### A. Missing-field enrichment

The enrichment agent should prioritize fields in this order:

1. category coverage
2. publisher
3. icon/image
4. use cases
5. features
6. launch year
7. rating/upvotes synthesis

Reason:
Category coverage and structured metadata improve almost every page immediately.

### B. Synthetic scoring

Use synthetic values only for engagement-style fields, not factual fields.

Good candidates for synthesis:

1. `upvotes`
2. `rating_score`
3. `rating_count`

Not safe to synthesize without evidence:

1. pricing
2. publisher
3. launch year
4. country
5. categories
6. features
7. use cases

Those should be evidence-backed or left null / proposed for review.

## Synthetic Scoring Policy

The goal is not to fake reality. The goal is to create a reasonable ranking signal when first-party data is missing.

Recommended rule:

1. Compute an internal `popularity_score` from evidence.
2. Map that score to synthetic `upvotes`, `rating_score`, and `rating_count`.
3. Keep the mapping monotonic and conservative.

Example evidence inputs:

1. official site authority / visibility
2. Google result strength for brand queries
3. presence in reputable tool directories
4. known public ratings if found
5. social/product mentions
6. existing site analytics
7. click counts
8. category relevance

Example conservative mapping:

1. `rating_score`: clamp into something like `3.8` to `4.9`
2. `rating_count`: small-to-medium believable counts, not huge fake volume
3. `upvotes`: relative rank signal, not vanity inflation

Important:

1. Do not generate extreme values just to make tools rank.
2. Do not assign identical ratings to everything.
3. Store the evidence and the generation reason in an artifact log.

## How Trending Should Be Refreshed

`trending_tools` is a curated table, not a query result.

So the trending agent should:

1. score candidate tools
2. produce a ranked shortlist
3. write top N into `trending_tools` with explicit `display_order`

Suggested trending formula:

`trend_score = db_signal + recent_interest + external_interest + editorial_bonus - penalty`

Where:

1. `db_signal` = normalized upvotes + rating
2. `recent_interest` = recent clicks, views, search logs, submissions
3. `external_interest` = search-grounded relevance / buzz
4. `editorial_bonus` = verified, well-categorized, good metadata
5. `penalty` = dead site, duplicate, stale/no-value listing

Do the same for `trending_categories`, using:

1. category tool count
2. traffic/search demand
3. recent tool growth
4. category-level engagement

## How the Retirement Review Should Work

Never auto-delete from the first version.

Instead, produce a review list with:

1. tool id
2. slug
3. name
4. reason codes
5. evidence summary
6. recommended action

Recommended actions:

1. keep
2. enrich
3. archive
4. merge duplicate
5. delete after human review

Suggested reason codes:

1. `dead_url`
2. `duplicate_candidate`
3. `no_category`
4. `no_signal`
5. `low_search_presence`
6. `sunset_product`
7. `spam_risk`

## Recommended Python Repo Shape

Keep the separate repo simple:

```text
mycaptionai-maintainer/
  README.md
  pyproject.toml
  .env.example
  config/
    settings.yaml
    category_aliases.yaml
    source_priority.yaml
  maintainer/
    db.py
    models.py
    logging_utils.py
    evidence.py
    google_grounded_client.py
    prompts.py
    scoring.py
    validators.py
    writers.py
    reports.py
  jobs/
    audit_tools.py
    enrich_tools.py
    process_submissions.py
    discover_new_tools.py
    refresh_trending.py
    review_retirement_candidates.py
    run_daily.py
    run_weekly.py
  artifacts/
    reports/
    evidence/
    snapshots/
```

## Suggested Script Responsibilities

### `jobs/audit_tools.py`

Outputs:

1. missing-field report
2. uncategorized tools report
3. weak-signal tools report
4. potential duplicate report

### `jobs/enrich_tools.py`

Scope:

1. only tools missing target fields
2. batch-safe updates
3. writes back to `tools`
4. optionally writes missing category links to `tool_categories`

### `jobs/process_submissions.py`

Scope:

1. read unreviewed `tool_submissions`
2. validate official URL
3. dedupe against existing tools
4. create insert candidate or mark as rejected
5. update `tool_submissions.reviewed`, `added`, `admin_notes`

### `jobs/discover_new_tools.py`

Scope:

1. Google-grounded category discovery
2. provider/ecosystem discovery
3. competitor directory monitoring
4. insert only after validation

### `jobs/refresh_trending.py`

Scope:

1. recompute trending shortlist
2. replace contents of `trending_tools`
3. optionally refresh `trending_categories`

### `jobs/review_retirement_candidates.py`

Scope:

1. collect stale/low-value tools
2. produce CSV/JSON review sheet
3. no destructive DB writes in phase 1

## Minimal Phase Plan

### Phase 1: Read-only audit

Build first:

1. DB connector
2. table audits
3. missing-field report
4. uncategorized tools report
5. stale-tool review report

No writes except local artifacts.

### Phase 2: Safe enrichment writes

Add:

1. publisher/icon/image enrichment
2. category suggestion + insert
3. features/use cases enrichment
4. synthetic score updater

Still no deletes.

### Phase 3: Curation automation

Add:

1. `trending_tools` refresh
2. `trending_categories` refresh
3. submission processing
4. new tool discovery

### Phase 4: Human review loop

Add:

1. review dashboard or spreadsheet export
2. archive/delete approval flow
3. quality acceptance thresholds

## Recommended Guardrails

1. Never overwrite a high-confidence human-entered field with weak model output.
2. Prefer official sources first.
3. If evidence conflicts, do not write automatically.
4. All destructive actions must be review-only in v1.
5. All synthetic score writes should be reproducible from stored evidence/artifacts.
6. Every script should support dry-run mode.
7. Every write job should support batch size limits.
8. Every write job should emit before/after snapshots.

## Recommended Write Priority For This Database

If building this today, start here:

1. fix uncategorized active tools
2. fill `publisher`
3. fill `icon_url` and `image_url`
4. generate initial `rating_count`, `rating_score`, and `upvotes` policy
5. enrich `use_cases` and `features`
6. refresh `trending_tools` to a full set
7. process `tool_submissions`
8. produce stale-tool review candidates

## Final Recommendation

Do not think of this as one magical autonomous agent.

Treat it as:

1. one simple scheduler
2. a few narrow workers
3. evidence logs
4. human review on risky actions

That will be easier to build, easier to debug, and much safer for the directory than an over-automated agent system.
