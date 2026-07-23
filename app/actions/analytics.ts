"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import {
    upsertVisitor,
    insertActivityLog,
    insertSearchQueries,
    isBotUserAgent,
    extractUtmParams,
} from "@/lib/db/analytics";
import type { Activity } from "@/types/analytics";

// ─── Helpers ────────────────────────────────────────────────────────────────

function detectDeviceType(userAgent: string): "desktop" | "mobile" | "tablet" | "bot" | "unknown" {
    const ua = userAgent.toLowerCase();
    if (!ua) return "unknown";
    if (/bot|crawler|spider|preview|slurp/.test(ua)) return "bot";
    if (/ipad|tablet/.test(ua)) return "tablet";
    if (/mobi|android|iphone/.test(ua)) return "mobile";
    return "desktop";
}

function normalizePath(pathname: string): string {
    if (!pathname) return "/";
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function hashValue(value: string | null | undefined, salt: string): string | null {
    if (!value) return null;
    return createHash("sha256")
        .update(`${salt}:${value.trim()}`)
        .digest("hex");
}

// ─── Server-side batch processor ────────────────────────────────────────────

interface ProcessBatchInput {
    visitor_id: string;
    session_id: string;
    activities: Activity[];
    referrer?: string;
    language?: string;
    timezone?: string;
    screen?: string;
}

/**
 * Processes a batch of activities from the server side.
 * This is for any server-side tracking needs (e.g., SSR page tracking).
 * The primary tracking path uses /api/track directly via sendBeacon.
 */
export async function processBatchedActivities(input: ProcessBatchInput): Promise<boolean> {
    if (!input.visitor_id || !input.session_id || !input.activities.length) return false;

    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent") || "";
    const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const vercelCountry = headerStore.get("x-vercel-ip-country");
    const vercelRegion = headerStore.get("x-vercel-ip-country-region");
    const vercelCity = headerStore.get("x-vercel-ip-city");
    const refererHeader = headerStore.get("referer");
    const acceptLanguage = headerStore.get("accept-language");

    const deviceType = detectDeviceType(userAgent);
    const hashSalt = process.env.ANALYTICS_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-salt";
    const uaHash = hashValue(userAgent, hashSalt);
    const ipHash = hashValue(forwardedFor, hashSalt);

    const referrerValue = input.referrer || refererHeader || null;
    let referrerHost: string | null = null;
    try {
        if (referrerValue) {
            referrerHost = new URL(referrerValue).hostname || null;
        }
    } catch {
        referrerHost = null;
    }

    const language = input.language || acceptLanguage?.split(",")[0]?.trim() || null;
    const isBot = deviceType === "bot";

    // Derive session meta
    const sorted = [...input.activities].sort((a, b) => a.ts - b.ts);
    const pageViews = sorted.filter((a) => a.t === "pv");
    const landingPage = pageViews[0]?.p ? normalizePath(pageViews[0].p) : normalizePath(sorted[0].p);
    const exitPage = pageViews.length > 0
        ? normalizePath(pageViews[pageViews.length - 1].p)
        : normalizePath(sorted[sorted.length - 1].p);

    // UTM from first page view
    const firstPv = pageViews[0];
    const utm = extractUtmParams(firstPv?.qs);

    // Upsert visitor
    const visitorOk = await upsertVisitor({
        visitor_id: input.visitor_id,
        user_agent_hash: uaHash,
        ip_hash: ipHash,
        device_type: deviceType,
        language,
        timezone: input.timezone || null,
        screen: input.screen || null,
        country_code: vercelCountry,
        region: vercelRegion,
        city: vercelCity,
        referrer: referrerValue,
        referrer_host: referrerHost,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        landing_page: landingPage,
        is_bot: isBot,
        page_view_count: pageViews.length,
    });

    if (!visitorOk) return false;

    // Insert activity log
    const logOk = await insertActivityLog({
        visitor_id: input.visitor_id,
        session_id: input.session_id,
        landing_page: landingPage,
        exit_page: exitPage,
        referrer: referrerValue,
        referrer_host: referrerHost,
        activities: input.activities,
        activity_count: input.activities.length,
        page_view_count: pageViews.length,
        session_start: sorted.length > 0 ? new Date(sorted[0].ts).toISOString() : null,
        session_end: sorted.length > 0 ? new Date(sorted[sorted.length - 1].ts).toISOString() : null,
        duration_ms: sorted.length > 1 ? sorted[sorted.length - 1].ts - sorted[0].ts : 0,
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        utm_term: utm.utm_term,
        utm_content: utm.utm_content,
        is_bot: isBot,
    });

    if (!logOk) return false;

    // Extract and insert search queries
    const searchQueries = input.activities
        .filter((a) => a.t === "sr" && a.q)
        .map((a) => ({
            visitor_id: input.visitor_id,
            session_id: input.session_id,
            query: a.q!.trim().slice(0, 500),
            path: a.p || null,
        }));

    if (searchQueries.length > 0) {
        await insertSearchQueries(searchQueries);
    }

    return true;
}
