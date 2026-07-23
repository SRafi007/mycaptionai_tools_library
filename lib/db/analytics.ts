import "server-only";

import { supabaseAnalyticsAdmin } from "@/lib/supabase/analytics-admin";
import type { Activity } from "@/types/analytics";

// ─── Visitor upsert ─────────────────────────────────────────────────────────

export interface UpsertVisitorData {
    visitor_id: string;
    user_agent_hash?: string | null;
    ip_hash?: string | null;
    device_type?: string | null;
    language?: string | null;
    timezone?: string | null;
    screen?: string | null;
    country_code?: string | null;
    region?: string | null;
    city?: string | null;
    referrer?: string | null;
    referrer_host?: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    landing_page?: string | null;
    is_bot?: boolean;
    page_view_count?: number;
}

/**
 * Upserts a visitor record.
 * - First visit: inserts full row with first-touch attribution.
 * - Return visit: updates mutable fields (last_seen, device info, geo),
 *   increments total_sessions and total_pageviews.
 *
 * Uses a try-insert / catch-update pattern because Supabase upsert
 * overwrites first-touch attribution fields on conflict, and we want
 * to preserve them.
 */
export async function upsertVisitor(data: UpsertVisitorData): Promise<boolean> {
    const now = new Date().toISOString();
    const pvCount = data.page_view_count ?? 0;

    // Try inserting a new visitor first
    const { error: insertError } = await supabaseAnalyticsAdmin
        .from("visitors")
        .insert({
            visitor_id: data.visitor_id,
            first_seen_at: now,
            last_seen_at: now,
            total_sessions: 1,
            total_pageviews: pvCount,
            user_agent_hash: data.user_agent_hash,
            ip_hash: data.ip_hash,
            device_type: data.device_type,
            language: data.language,
            timezone: data.timezone,
            screen: data.screen,
            country_code: data.country_code,
            region: data.region,
            city: data.city,
            first_referrer: data.referrer,
            first_referrer_host: data.referrer_host,
            first_utm_source: data.utm_source,
            first_utm_medium: data.utm_medium,
            first_utm_campaign: data.utm_campaign,
            first_landing_page: data.landing_page,
            is_bot: data.is_bot ?? false,
        });

    // If insert succeeded, this is a new visitor — done
    if (!insertError) return true;

    // If the error is a unique violation (code 23505), visitor already exists → update
    if (insertError.code === "23505") {
        // Fetch current counters so we can increment them
        const { data: existing } = await supabaseAnalyticsAdmin
            .from("visitors")
            .select("total_sessions, total_pageviews")
            .eq("visitor_id", data.visitor_id)
            .single();

        const currentSessions = existing?.total_sessions ?? 0;
        const currentPageviews = existing?.total_pageviews ?? 0;

        const { error: updateError } = await supabaseAnalyticsAdmin
            .from("visitors")
            .update({
                last_seen_at: now,
                total_sessions: currentSessions + 1,
                total_pageviews: currentPageviews + pvCount,
                user_agent_hash: data.user_agent_hash,
                ip_hash: data.ip_hash,
                device_type: data.device_type,
                language: data.language,
                timezone: data.timezone,
                screen: data.screen,
                country_code: data.country_code,
                region: data.region,
                city: data.city,
                is_bot: data.is_bot ?? false,
                updated_at: now,
                // Note: first-touch fields are NOT updated (first_referrer, first_utm_*, etc.)
            })
            .eq("visitor_id", data.visitor_id);

        if (updateError) {
            console.error("Error updating visitor:", updateError);
            return false;
        }

        return true;
    }

    // Some other insert error
    console.error("Error inserting visitor:", insertError);
    return false;
}

// ─── Activity log insert ────────────────────────────────────────────────────

export interface InsertActivityLogData {
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
}

/**
 * Inserts a batched activity log — one row per session flush.
 */
export async function insertActivityLog(data: InsertActivityLogData): Promise<boolean> {
    const { error } = await supabaseAnalyticsAdmin.from("activity_logs").insert({
        visitor_id: data.visitor_id,
        session_id: data.session_id,
        landing_page: data.landing_page,
        exit_page: data.exit_page,
        referrer: data.referrer,
        referrer_host: data.referrer_host,
        activities: data.activities,
        activity_count: data.activity_count,
        page_view_count: data.page_view_count,
        session_start: data.session_start,
        session_end: data.session_end,
        duration_ms: data.duration_ms,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        utm_term: data.utm_term,
        utm_content: data.utm_content,
        is_bot: data.is_bot ?? false,
    });

    if (error) {
        console.error("Error inserting activity log:", error);
        return false;
    }

    return true;
}

// ─── Search queries insert ──────────────────────────────────────────────────

export interface InsertSearchQueryData {
    visitor_id?: string | null;
    session_id?: string | null;
    query: string;
    path?: string | null;
    results_count?: number | null;
}

/**
 * Inserts one or more search query records extracted from activities.
 */
export async function insertSearchQueries(queries: InsertSearchQueryData[]): Promise<boolean> {
    if (!queries.length) return true;

    const { error } = await supabaseAnalyticsAdmin.from("search_queries").insert(queries);

    if (error) {
        console.error("Error inserting search queries:", error);
        return false;
    }

    return true;
}

// ─── Helpers (kept from previous version) ───────────────────────────────────

/**
 * Helper to identify bots by parsing the user agent string.
 */
export function isBotUserAgent(userAgent: string | null | undefined): boolean {
    if (!userAgent) return true; // Suspect bot if missing user-agent
    const ua = userAgent.toLowerCase();
    const botKeywords = [
        "bot", "crawler", "spider", "slurp", "scrape", "fetch", "archiver",
        "googlebot", "bingbot", "yandex", "baidu", "duckduckgo", "teoma", "ia_archiver",
        "chatgpt", "gptbot", "openai", "anthropic", "claude", "cohere", "google-extended",
        "facebookexternalhit", "facebookbot", "meta-externalagent", "semrush", "ahrefs",
        "mj12", "dotbot", "exabot", "screaming frog", "pinterest", "telegrambot", 
        "twitterbot", "slackbot", "discordbot", "whatsapp", "applebot", "bingpreview",
        "adsbot", "amazonbot", "feedparser", "lighthouse", "pagespeed", "headlesschrome",
        "puppeteer", "playwright", "selenium", "phantomjs", "axios", "postman",
        "python-requests", "node-fetch", "got", "superagent", "httpclient", "java/"
    ];
    return botKeywords.some(keyword => ua.includes(keyword));
}

/**
 * Helper to parse UTM tags from a query string.
 */
export function extractUtmParams(queryString?: string | null): {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
} {
    const result = {
        utm_source: null as string | null,
        utm_medium: null as string | null,
        utm_campaign: null as string | null,
        utm_term: null as string | null,
        utm_content: null as string | null,
    };
    if (!queryString) return result;

    try {
        const cleanQuery = queryString.startsWith("?") ? queryString : `?${queryString}`;
        const params = new URLSearchParams(cleanQuery);
        result.utm_source = params.get("utm_source");
        result.utm_medium = params.get("utm_medium");
        result.utm_campaign = params.get("utm_campaign");
        result.utm_term = params.get("utm_term");
        result.utm_content = params.get("utm_content");
    } catch {
        // fail silently
    }

    return result;
}
