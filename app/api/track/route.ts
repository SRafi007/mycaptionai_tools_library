import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
    upsertVisitor,
    insertActivityLog,
    insertSearchQueries,
    isBotUserAgent,
    extractUtmParams,
} from "@/lib/db/analytics";
import type { Activity, FlushPayload } from "@/types/analytics";

export const dynamic = "force-dynamic";

// ─── Helpers ────────────────────────────────────────────────────────────────

function hashValue(value: string | null | undefined, salt: string): string | null {
    if (!value) return null;
    return createHash("sha256")
        .update(`${salt}:${value.trim()}`)
        .digest("hex");
}

function normalizePath(pathname: string | null | undefined): string {
    if (!pathname) return "/";
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function detectDeviceType(userAgent: string, isBot: boolean): "desktop" | "mobile" | "tablet" | "bot" | "unknown" {
    if (isBot) return "bot";
    const ua = userAgent.toLowerCase();
    if (!ua) return "unknown";
    if (/ipad|tablet/.test(ua)) return "tablet";
    if (/mobi|android|iphone/.test(ua)) return "mobile";
    return "desktop";
}

/**
 * Derives session timing and page paths from the activities array.
 */
function deriveSessionMeta(activities: Activity[]) {
    if (!activities.length) {
        return {
            landing_page: null,
            exit_page: null,
            session_start: null,
            session_end: null,
            duration_ms: null,
            page_view_count: 0,
        };
    }

    // Sort by timestamp ascending
    const sorted = [...activities].sort((a, b) => a.ts - b.ts);

    // Find page views for landing/exit
    const pageViews = sorted.filter((a) => a.t === "pv");
    const landingPage = pageViews.length > 0
        ? normalizePath(pageViews[0].p)
        : normalizePath(sorted[0].p);
    const exitPage = pageViews.length > 0
        ? normalizePath(pageViews[pageViews.length - 1].p)
        : normalizePath(sorted[sorted.length - 1].p);

    const sessionStartMs = sorted[0].ts;
    const sessionEndMs = sorted[sorted.length - 1].ts;

    return {
        landing_page: landingPage,
        exit_page: exitPage,
        session_start: new Date(sessionStartMs).toISOString(),
        session_end: new Date(sessionEndMs).toISOString(),
        duration_ms: sessionEndMs - sessionStartMs,
        page_view_count: pageViews.length,
    };
}

/**
 * Extracts search queries from activities for the search_queries table.
 */
function extractSearchQueries(
    activities: Activity[],
    visitorId: string | null,
    sessionId: string | null,
) {
    return activities
        .filter((a) => a.t === "sr" && a.q)
        .map((a) => ({
            visitor_id: visitorId,
            session_id: sessionId,
            query: a.q!.trim().slice(0, 500),
            path: a.p || null,
        }));
}

// ─── POST handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    try {
        // ── 1. Parse payload ──
        let payload: FlushPayload;
        try {
            payload = await request.json();
        } catch {
            return new NextResponse(null, { status: 400 });
        }

        // Validate required fields
        if (!payload.visitor_id || !payload.session_id || !Array.isArray(payload.activities)) {
            return new NextResponse(null, { status: 400 });
        }

        // Skip empty flushes
        if (payload.activities.length === 0) {
            return new NextResponse(null, { status: 204 });
        }

        // ── 2. Extract server-side context ──
        const headers = request.headers;
        const userAgent = headers.get("user-agent") || "";
        const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        const vercelCountry = headers.get("x-vercel-ip-country");
        const vercelRegion = headers.get("x-vercel-ip-country-region");
        const vercelCity = headers.get("x-vercel-ip-city");
        const refererHeader = headers.get("referer");
        const acceptLanguage = headers.get("accept-language");

        // ── 3. Bot detection ──
        const uaIsBot = isBotUserAgent(userAgent);
        const clientSaysIsBot = payload.is_webdriver === true || payload.is_headless === true;
        const missingAcceptLanguage = !acceptLanguage && !uaIsBot;
        const suspiciousHeaders = missingAcceptLanguage && userAgent.length < 30;
        const isBot = uaIsBot || clientSaysIsBot || suspiciousHeaders;

        // ── 4. Hash sensitive values ──
        const hashSalt = process.env.ANALYTICS_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-salt";
        const uaHash = hashValue(userAgent, hashSalt);
        const ipHash = hashValue(forwardedFor, hashSalt);
        const deviceType = detectDeviceType(userAgent, isBot);

        // ── 5. Referrer ──
        const referrerValue = payload.referrer || refererHeader || null;
        let referrerHost: string | null = null;
        try {
            if (referrerValue) {
                referrerHost = new URL(referrerValue).hostname || null;
            }
        } catch {
            referrerHost = null;
        }

        // ── 6. UTM from the first page view's query string ──
        const firstPageView = payload.activities.find((a) => a.t === "pv");
        const queryString = firstPageView?.qs || "";
        const utm = extractUtmParams(queryString);

        // ── 7. Language ──
        const language = payload.language || acceptLanguage?.split(",")[0]?.trim() || null;

        // ── 8. Derive session metadata ──
        const sessionMeta = deriveSessionMeta(payload.activities);

        // ── 9. Upsert visitor ──
        const visitorOk = await upsertVisitor({
            visitor_id: payload.visitor_id,
            user_agent_hash: uaHash,
            ip_hash: ipHash,
            device_type: deviceType,
            language,
            timezone: payload.timezone || null,
            screen: payload.screen || null,
            country_code: vercelCountry,
            region: vercelRegion,
            city: vercelCity,
            referrer: referrerValue,
            referrer_host: referrerHost,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            landing_page: sessionMeta.landing_page,
            is_bot: isBot,
            page_view_count: sessionMeta.page_view_count,
        });

        if (!visitorOk) {
            console.error("Failed to upsert visitor:", payload.visitor_id);
            return new NextResponse(null, { status: 500 });
        }

        // ── 10. Insert activity log ──
        const logOk = await insertActivityLog({
            visitor_id: payload.visitor_id,
            session_id: payload.session_id,
            landing_page: sessionMeta.landing_page,
            exit_page: sessionMeta.exit_page,
            referrer: referrerValue,
            referrer_host: referrerHost,
            activities: payload.activities,
            activity_count: payload.activities.length,
            page_view_count: sessionMeta.page_view_count,
            session_start: sessionMeta.session_start,
            session_end: sessionMeta.session_end,
            duration_ms: sessionMeta.duration_ms,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            utm_term: utm.utm_term,
            utm_content: utm.utm_content,
            is_bot: isBot,
        });

        if (!logOk) {
            console.error("Failed to insert activity log for visitor:", payload.visitor_id);
            return new NextResponse(null, { status: 500 });
        }

        // ── 11. Extract and insert search queries ──
        const searchQueries = extractSearchQueries(
            payload.activities,
            payload.visitor_id,
            payload.session_id,
        );

        if (searchQueries.length > 0) {
            await insertSearchQueries(searchQueries);
            // Non-critical: don't fail the whole request if search query insert fails
        }

        // Return 204 No Content
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Critical error in analytics tracking endpoint:", err);
        return new NextResponse(null, { status: 500 });
    }
}
