// ─── Visitor (visitors table) ───────────────────────────────────────────────
export interface Visitor {
    id?: string;
    visitor_id: string;
    first_seen_at?: string;
    last_seen_at?: string;
    total_sessions?: number;
    total_pageviews?: number;
    user_agent_hash?: string | null;
    ip_hash?: string | null;
    device_type?: string | null;
    language?: string | null;
    timezone?: string | null;
    screen?: string | null;
    country_code?: string | null;
    region?: string | null;
    city?: string | null;
    first_referrer?: string | null;
    first_referrer_host?: string | null;
    first_utm_source?: string | null;
    first_utm_medium?: string | null;
    first_utm_campaign?: string | null;
    first_landing_page?: string | null;
    is_bot?: boolean;
    created_at?: string;
    updated_at?: string;
}

// ─── Activity (individual item inside the JSONB activities array) ───────────
// Uses short keys to keep payload small over sendBeacon
export interface Activity {
    /** type: pv=page_view, ck=click, sr=search, fs=form_submit */
    t: "pv" | "ck" | "sr" | "fs";
    /** path */
    p: string;
    /** timestamp (ms since epoch) */
    ts: number;
    /** page title */
    tt?: string;
    /** target (href, form action) */
    tg?: string;
    /** label (button text, link text) */
    lb?: string;
    /** element tag name */
    el?: string;
    /** search query */
    q?: string;
    /** query string (?key=val) */
    qs?: string;
}

// ─── ActivityLog (activity_logs table) ──────────────────────────────────────
export interface ActivityLog {
    id?: string;
    visitor_id: string;
    session_id: string;
    landing_page?: string | null;
    exit_page?: string | null;
    referrer?: string | null;
    referrer_host?: string | null;
    activities: Activity[];
    activity_count: number;
    page_view_count: number;
    session_start?: string | null;
    session_end?: string | null;
    duration_ms?: number | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    is_bot?: boolean;
    created_at?: string;
}

// ─── SearchQuery (search_queries table) ─────────────────────────────────────
export interface SearchQuery {
    id?: string;
    visitor_id?: string | null;
    session_id?: string | null;
    query: string;
    path?: string | null;
    results_count?: number | null;
    created_at?: string;
}

// ─── PageStats (page_stats table — auto-updated via trigger) ────────────────
export interface PageStats {
    path: string;
    total_views: number;
    total_clicks: number;
    unique_visitors: number;
    first_viewed_at?: string | null;
    last_viewed_at?: string;
    updated_at?: string;
}

// ─── FlushPayload (client → server request body) ───────────────────────────
export interface FlushPayload {
    visitor_id: string;
    session_id: string;
    activities: Activity[];
    referrer?: string;
    language?: string;
    timezone?: string;
    screen?: string;
    is_webdriver?: boolean;
    is_headless?: boolean;
}
