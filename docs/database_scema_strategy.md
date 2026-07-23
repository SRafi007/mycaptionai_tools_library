# Database Schema Strategy

## Overview

The database uses Supabase (PostgreSQL) and focuses on a relational structure for Tools, Categories, and Tags, while keeping a flexible Analytics table for tracking user interactions.

## Tables

### 1. `tools`
Stores the main content of the platform.
- **id**: UUID
- **name**: Text
- **slug**: Text (Unique URL identifier)
- **description**: Text
- **url**: Text (External link)
- **pricing_type**: Enum/Text ('Free', 'Freemium', 'Paid')
- **is_verified**: Boolean

### 2. `categories`
Groups tools into high-level buckets.
- **id**: UUID
- **name**: Text
- **slug**: Text

### 3. `tags`
Granular descriptors for tools (many-to-many).
- **id**: UUID
- **name**: Text

### 4. `tool_categories` & `tool_tags`
Join tables handling the many-to-many relationships.

### 5. `visitors`
Identifies unique visitors with fingerprint data and first-touch attribution.
- **visitor_id**: Text (Unique, from localStorage UUID)
- **first_seen_at / last_seen_at**: Timestamps for lifecycle tracking
- **total_sessions / total_pageviews**: Aggregated counters
- **user_agent_hash / ip_hash**: Privacy-safe hashed identifiers
- **device_type / language / timezone / screen**: Environment fingerprint
- **country_code / region / city**: Geo from Vercel headers
- **first_referrer / first_utm_***: First-touch attribution (never overwritten)
- **is_bot**: Boolean flag

### 6. `activity_logs`
One row per session flush — all activities stored as a JSONB array.
- **visitor_id**: References `visitors(visitor_id)`
- **session_id**: UUID (from sessionStorage)
- **landing_page / exit_page**: Derived from activities
- **activities**: JSONB array of activity objects (page views, clicks, searches, form submits)
- **activity_count / page_view_count**: Denormalized counts
- **session_start / session_end / duration_ms**: Timing derived from activity timestamps
- **utm_***: UTM parameters for this session
- **is_bot**: Boolean flag

### 7. `page_stats`
Per-page aggregates auto-updated via a PostgreSQL trigger on `activity_logs`.
- **path**: Text (Primary Key)
- **total_views / total_clicks / unique_visitors**: Aggregate counters
- **first_viewed_at / last_viewed_at**: Lifecycle timestamps

### 8. `search_queries`
First-class search query log for discovery and trending analysis.
- **visitor_id / session_id**: Link to visitor and session
- **query**: The search query text
- **path**: Page where the search was performed
- **results_count**: Optional result count

## Security (RLS)

- **Public Access**: All content tables (`tools`, `categories`, `tags`) are readable by `anon` (public).
- **Write Access**: Only `service_role` (Admin) can modify content.
- **Analytics** (`visitors`, `activity_logs`, `page_stats`, `search_queries`):
    - All operations restricted to `service_role` only (read + write).
