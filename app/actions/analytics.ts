"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { trackEvent } from "@/lib/db/analytics";

interface TrackPageViewInput {
    pathname: string;
    query_string?: string;
    visitor_id?: string;
    session_id?: string;
    referrer?: string;
    consent_status?: "granted" | "denied" | "unknown";
    dnt_signal?: boolean;
    gpc_signal?: boolean;
    timezone?: string;
}

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

export async function trackPageView(input: TrackPageViewInput) {
    if (!input?.pathname) return false;

    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent") || "";
    const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const vercelCountry = headerStore.get("x-vercel-ip-country");
    const vercelRegion = headerStore.get("x-vercel-ip-country-region");
    const vercelCity = headerStore.get("x-vercel-ip-city");
    const refererHeader = headerStore.get("referer");

    const referrerValue = input.referrer || refererHeader || null;
    let referrerHost: string | null = null;
    let utmSource: string | null = null;
    let utmMedium: string | null = null;
    let utmCampaign: string | null = null;
    let utmTerm: string | null = null;
    let utmContent: string | null = null;

    try {
        if (referrerValue) {
            referrerHost = new URL(referrerValue).hostname || null;
        }
    } catch {
        referrerHost = null;
    }

    try {
        const params = new URLSearchParams(input.query_string || "");
        utmSource = params.get("utm_source");
        utmMedium = params.get("utm_medium");
        utmCampaign = params.get("utm_campaign");
        utmTerm = params.get("utm_term");
        utmContent = params.get("utm_content");
    } catch {
        // Ignore malformed query strings.
    }

    const consentStatus = input.consent_status || "unknown";
    const dntSignal = Boolean(input.dnt_signal || headerStore.get("dnt") === "1");
    const gpcSignal = Boolean(
        input.gpc_signal ||
        headerStore.get("sec-gpc") === "1" ||
        headerStore.get("sec-gpc")?.toLowerCase() === "true"
    );

    let privacyMode: "consented" | "opted_out" | "gpc" | "dnt" | "unknown" = "unknown";
    if (gpcSignal) privacyMode = "gpc";
    else if (dntSignal) privacyMode = "dnt";
    else if (consentStatus === "granted") privacyMode = "consented";
    else if (consentStatus === "denied") privacyMode = "opted_out";

    const hashSalt = process.env.ANALYTICS_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-salt";
    const uaHash = hashValue(userAgent, hashSalt);
    const ipHash = hashValue(forwardedFor, hashSalt);
    const deviceType = detectDeviceType(userAgent);

    return trackEvent({
        event_type: "page_view",
        path: normalizePath(input.pathname),
        referer: referrerValue,
        referrer_host: referrerHost,
        device_type: deviceType,
        country: vercelCountry,
        country_code: vercelCountry,
        region: vercelRegion,
        city: vercelCity,
        session_id: input.session_id || null,
        visitor_id: input.visitor_id || null,
        consent_status: consentStatus,
        privacy_mode: privacyMode,
        dnt_signal: dntSignal,
        gpc_signal: gpcSignal,
        is_bot: deviceType === "bot",
        user_agent_hash: uaHash,
        ip_hash: ipHash,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
        metadata: {
            tz: input.timezone || null,
        }
    });
}
