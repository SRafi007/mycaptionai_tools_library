"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { trackEvent } from "@/lib/db/analytics";

interface TrackBaseInput {
    pathname: string;
    query_string?: string;
    visitor_id?: string;
    session_id?: string;
    referrer?: string;
    language?: string;
    timezone?: string;
    page_title?: string;
    screen?: string;
}

type TrackPageViewInput = TrackBaseInput;

interface TrackUserActionInput extends TrackBaseInput {
    action: string;
    action_target?: string;
    action_label?: string;
    action_element?: string;
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

function normalizeLanguage(inputLanguage: string | undefined, acceptLanguageHeader: string | null): string | null {
    const fallback = acceptLanguageHeader?.split(",")[0]?.trim() || null;
    if (!inputLanguage) return fallback;
    return inputLanguage.trim() || fallback;
}

async function buildCommonEventFields(input: TrackBaseInput) {
    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent") || "";
    const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const vercelCountry = headerStore.get("x-vercel-ip-country");
    const vercelRegion = headerStore.get("x-vercel-ip-country-region");
    const vercelCity = headerStore.get("x-vercel-ip-city");
    const refererHeader = headerStore.get("referer");
    const acceptLanguage = headerStore.get("accept-language");
    const deviceType = detectDeviceType(userAgent);

    const referrerValue = input.referrer || refererHeader || null;
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

    return {
        path: normalizePath(input.pathname),
        referer: referrerValue,
        referrer_host: referrerHost,
        device_type: deviceType,
        country: vercelCountry,
        country_code: vercelCountry,
        region: vercelRegion,
        city: vercelCity,
        language: normalizeLanguage(input.language, acceptLanguage),
        session_id: input.session_id || null,
        visitor_id: input.visitor_id || null,
        is_bot: deviceType === "bot",
        user_agent_hash: uaHash,
        ip_hash: ipHash,
        metadata: {
            tz: input.timezone || null,
            query_string: input.query_string || null,
            page_title: input.page_title || null,
            screen: input.screen || null,
        },
    };
}

export async function trackPageView(input: TrackPageViewInput) {
    if (!input?.pathname) return false;

    const commonFields = await buildCommonEventFields(input);

    return trackEvent({
        event_type: "page_view",
        ...commonFields,
        page_title: input.page_title || null,
    });
}

export async function trackUserAction(input: TrackUserActionInput) {
    if (!input?.pathname || !input?.action) return false;

    const commonFields = await buildCommonEventFields(input);

    return trackEvent({
        event_type: "user_action",
        ...commonFields,
        page_title: input.page_title || null,
        action_name: input.action,
        action_target: input.action_target || null,
        metadata: {
            ...commonFields.metadata,
            action_label: input.action_label || null,
            action_element: input.action_element || null,
        },
    });
}
