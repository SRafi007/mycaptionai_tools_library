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

    return true;
}
