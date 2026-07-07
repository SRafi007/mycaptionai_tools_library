import "server-only";

import { supabaseAnalyticsAdmin } from "@/lib/supabase/analytics-admin";
import { AnalyticsEvent } from "@/types/analytics";

/**
 * Tracks an analytics event.
 * Uses service role on server only, so client code cannot write directly.
 */
export async function trackEvent(event: Omit<AnalyticsEvent, "id" | "created_at">): Promise<boolean> {
    const { error } = await supabaseAnalyticsAdmin.from("analytics").insert(event);

    if (error) {
        console.error("Error tracking event:", error);
        return false;
    }

    return true;
}

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
