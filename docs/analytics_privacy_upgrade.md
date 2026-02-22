# Analytics Privacy Upgrade (V5)

## What Changed
- Added `lib/supabase/schema_update_v5_analytics.sql`:
  - Enriched `analytics` event columns for consent/privacy/session fields.
  - Added `analytics_sessions` for efficient per-session reporting.
  - Added `analytics_daily_metrics` + `refresh_analytics_daily_metrics(...)` for rollups.
  - Added `purge_old_analytics(...)` retention helper.
  - Tightened analytics RLS to service-role writes/reads.
- Updated tracking flow:
  - `components/analytics/analytics-consent-banner.tsx` adds explicit analytics consent choice.
  - `components/analytics/page-view-tracker.tsx` only tracks after consent and blocks tracking on DNT/GPC.
  - `app/actions/analytics.ts` hashes IP/User-Agent with salt and stores minimized metadata.
  - `lib/db/analytics.ts` writes with service-role and keeps `analytics_sessions` in sync.

## Required Env Vars
- `ANALYTICS_HASH_SALT`: long random string for stable hashing of network/user-agent identifiers.

## Migration Steps
1. Run SQL file `lib/supabase/schema_update_v5_analytics.sql` in Supabase SQL editor.
2. Set `ANALYTICS_HASH_SALT` in your deployment and local `.env.local`.
3. Deploy app changes.
4. Verify:
   - Consent banner appears on first visit.
   - No analytics row inserted before consent.
   - `page_view` row inserted after consent.
   - Session row appears in `analytics_sessions`.

## Optional Jobs
- Daily rollup refresh:
  - `SELECT refresh_analytics_daily_metrics(CURRENT_DATE - 7, CURRENT_DATE);`
- Retention cleanup:
  - `SELECT purge_old_analytics(395);`

