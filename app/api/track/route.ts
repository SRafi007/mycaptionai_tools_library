import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { trackEvent, isBotUserAgent, extractUtmParams } from "@/lib/db/analytics";

export const dynamic = "force-dynamic";

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

export async function POST(request: NextRequest) {
    try {
        let payload: any;
        try {
            payload = await request.json();
        } catch {
            return new NextResponse(null, { status: 400 });
        }

        const headers = request.headers;
        const userAgent = headers.get("user-agent") || "";
        const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
        const vercelCountry = headers.get("x-vercel-ip-country");
        const vercelRegion = headers.get("x-vercel-ip-country-region");
        const vercelCity = headers.get("x-vercel-ip-city");
        const refererHeader = headers.get("referer");
        const acceptLanguage = headers.get("accept-language");

        // ─── 1. Bot Detection Heuristics ───
        const uaIsBot = isBotUserAgent(userAgent);
        const clientSaysIsBot = payload.is_webdriver === true || payload.is_headless === true;
        
        // Suspicious client signal: standard browser should send accept-language header
        const missingAcceptLanguage = !acceptLanguage && !uaIsBot;
        const suspiciousHeaders = missingAcceptLanguage && userAgent.length < 30;

        const isBot = uaIsBot || clientSaysIsBot || suspiciousHeaders;

        // ─── 2. UTM Parameters Extraction ───
        const queryString = payload.query_string || "";
        const utm = extractUtmParams(queryString);

        // ─── 3. Geolocation & Referrer Formatting ───
        const referrerValue = payload.referrer || refererHeader || null;
        let referrerHost: string | null = null;
        try {
            if (referrerValue) {
                referrerHost = new URL(referrerValue).hostname || null;
            }
        } catch {
            referrerHost = null;
        }

        const hashSalt = process.env.ANALYTICS_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-salt";
        const uaHash = hashValue(userAgent, hashSalt);
        const ipHash = hashValue(forwardedFor, hashSalt);
        const deviceType = detectDeviceType(userAgent, isBot);

        // Formulate DB record
        const eventData = {
            event_type: payload.event_type || "page_view",
            path: normalizePath(payload.pathname),
            referer: referrerValue,
            referrer_host: referrerHost,
            device_type: deviceType,
            country: vercelCountry,
            country_code: vercelCountry,
            region: vercelRegion,
            city: vercelCity,
            language: payload.language || acceptLanguage?.split(",")[0]?.trim() || null,
            session_id: payload.session_id || null,
            visitor_id: payload.visitor_id || null,
            is_bot: isBot,
            user_agent_hash: uaHash,
            ip_hash: ipHash,
            page_title: payload.page_title || null,
            action_name: payload.action_name || null,
            action_target: payload.action_target || null,
            utm_source: utm.utm_source,
            utm_medium: utm.utm_medium,
            utm_campaign: utm.utm_campaign,
            utm_term: utm.utm_term,
            utm_content: utm.utm_content,
            metadata: {
                tz: payload.timezone || null,
                query_string: queryString || null,
                screen: payload.screen || null,
                action_label: payload.action_label || null,
                action_element: payload.action_element || null,
                is_webdriver: payload.is_webdriver || false,
                is_headless: payload.is_headless || false,
            },
        };

        const success = await trackEvent(eventData);
        if (!success) {
            return new NextResponse(null, { status: 500 });
        }

        // Return 204 No Content for high-performance tracking
        return new NextResponse(null, { status: 204 });
    } catch (err) {
        console.error("Critical error in analytics tracking endpoint:", err);
        return new NextResponse(null, { status: 500 });
    }
}
