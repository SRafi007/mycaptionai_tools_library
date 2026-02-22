import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { AnalyticsEvent } from "@/types/analytics";

/**
 * Tracks an analytics event.
 * Uses service role on server only, so client code cannot write directly.
 */
export async function trackEvent(event: Omit<AnalyticsEvent, "id" | "created_at">): Promise<boolean> {
    const { error } = await supabaseAdmin.from("analytics").insert(event);

    if (error) {
        console.error("Error tracking event:", error);
        return false;
    }

    const sessionId = event.session_id;
    if (!sessionId) return true;

    const isPageView = event.event_type === "page_view";
    const nowIso = new Date().toISOString();

    const { data: existing, error: lookupError } = await supabaseAdmin
        .from("analytics_sessions")
        .select("event_count,page_views")
        .eq("session_id", sessionId)
        .maybeSingle();

    if (lookupError) {
        console.error("Error reading analytics_sessions:", lookupError);
        return true;
    }

    if (!existing) {
        const { error: insertError } = await supabaseAdmin.from("analytics_sessions").insert({
            session_id: sessionId,
            visitor_id: event.visitor_id || null,
            device_type: event.device_type || null,
            country_code: event.country_code || null,
            region: event.region || null,
            city: event.city || null,
            referrer_host: event.referrer_host || null,
            last_path: event.path || null,
            consent_status: event.consent_status || "unknown",
            privacy_mode: event.privacy_mode || "unknown",
            first_seen_at: nowIso,
            last_seen_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
            event_count: 1,
            page_views: isPageView ? 1 : 0,
        });

        if (insertError) {
            console.error("Error inserting analytics_sessions:", insertError);
        }
        return true;
    }

    const { error: updateError } = await supabaseAdmin
        .from("analytics_sessions")
        .update({
            visitor_id: event.visitor_id || null,
            device_type: event.device_type || null,
            country_code: event.country_code || null,
            region: event.region || null,
            city: event.city || null,
            referrer_host: event.referrer_host || null,
            last_path: event.path || null,
            consent_status: event.consent_status || "unknown",
            privacy_mode: event.privacy_mode || "unknown",
            last_seen_at: nowIso,
            updated_at: nowIso,
            event_count: (existing.event_count || 0) + 1,
            page_views: (existing.page_views || 0) + (isPageView ? 1 : 0),
        })
        .eq("session_id", sessionId);

    if (updateError) {
        console.error("Error updating analytics_sessions:", updateError);
    }

    return true;
}
