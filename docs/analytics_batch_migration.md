# Analytics Batch Migration Guide

## What Changed

The old single-table `analytics` system (one row per event) has been replaced with a **4-table visitor + batched activity log model**:

| Old | New |
|-----|-----|
| `analytics` (dropped) | `visitors` + `activity_logs` + `page_stats` + `search_queries` |
| `analytics_sessions` (dropped) | Replaced by `visitors` table |
| `analytics_daily_metrics` (dropped) | Replaced by `page_stats` table |

### New Tables

1. **`visitors`** — One row per unique visitor, identified by localStorage UUID. Stores fingerprint data and first-touch attribution.
2. **`activity_logs`** — One row per session flush. Contains a JSONB `activities` array with all page views, clicks, searches, and form submits from the session.
3. **`page_stats`** — Per-page aggregate counters (views, clicks). Auto-updated via a PostgreSQL trigger on `activity_logs` inserts.
4. **`search_queries`** — Dedicated search query log. Extracted server-side from activities and inserted as individual rows.

## How It Works

### Client Side
- `components/analytics/page-view-tracker.tsx` buffers all activities in a JS array
- Activities are flushed as a single JSON payload via `sendBeacon` on tab close/hide
- Safety flush every 60 seconds if buffer is non-empty
- Force flush if buffer exceeds 50 items

### Server Side
- `POST /api/track` receives the batched payload
- Upserts visitor record (insert new / update returning)
- Inserts one `activity_logs` row with the full JSONB array
- Extracts and inserts search queries into `search_queries`
- `page_stats` auto-updated by PostgreSQL trigger

## SQL Migration

Run `lib/supabase/schema_update_v14_analytics_overhaul.sql` in the Supabase SQL editor.

This will:
- Drop `analytics`, `analytics_sessions`, `analytics_daily_metrics` tables
- Drop `refresh_analytics_daily_metrics` and `purge_old_analytics` functions
- Create 4 new tables with indexes and RLS
- Create the `update_page_stats_from_activity` trigger function
- Create the `purge_old_activity_data` retention function

## Querying the New Tables

### Top pages by views
```sql
SELECT path, total_views, total_clicks
FROM page_stats
ORDER BY total_views DESC
LIMIT 20;
```

### Recent visitor sessions
```sql
SELECT v.visitor_id, v.device_type, v.country_code,
       al.landing_page, al.exit_page, al.activity_count, al.duration_ms
FROM activity_logs al
JOIN visitors v ON v.visitor_id = al.visitor_id
ORDER BY al.created_at DESC
LIMIT 50;
```

### What a specific visitor did
```sql
SELECT session_id, activities, activity_count, session_start, session_end
FROM activity_logs
WHERE visitor_id = 'some-visitor-uuid'
ORDER BY created_at DESC;
```

### Top search queries
```sql
SELECT query, COUNT(*) as search_count
FROM search_queries
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;
```

### Page views for a specific path (from JSONB)
```sql
SELECT COUNT(*)
FROM activity_logs,
     jsonb_array_elements(activities) AS act
WHERE act->>'t' = 'pv'
  AND act->>'p' = '/tools/chatgpt';
```

## Impact on External Consumers

The **maintenance agent repo** (`mycaptionai-maintainer`) references the `analytics` table in:
- Audit Agent (reads analytics for health reports)
- Trending Refresh Agent (reads analytics for popularity signals)

These agents need to be updated to query from `activity_logs` and `page_stats` instead.

## Data Retention

Use the retention function to purge old data:
```sql
SELECT purge_old_activity_data(395); -- 13 months
```

## Environment Variables

No new environment variables required. Existing `ANALYTICS_HASH_SALT` is still used for IP/UA hashing.
