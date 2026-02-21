import { createClient } from "@/lib/supabase/server";
import { AnalyticsEvent } from "@/types/analytics";

/**
 * Tracks an analytics event.
 * Note: This function is intended to be used in Server Actions or Server Components.
 * If you need to track events from the client, you should call a Server Action that uses this function,
 * or use the client-side Supabase client directly if RLS allows public inserts.
 */
export async function trackEvent(event: Omit<AnalyticsEvent, "id" | "created_at">): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("analytics").insert(event);

    if (error) {
        console.error("Error tracking event:", error);
        return false;
    }

    return true;
}
