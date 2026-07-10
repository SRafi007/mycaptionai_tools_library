import "server-only";

import { supabaseAnalyticsAdmin } from "@/lib/supabase/analytics-admin";
import { AIClip } from "@/types/ai-clip";

const supabase = supabaseAnalyticsAdmin;

/**
 * Fetches lightweight metadata (id, display_score, created_at) for all active clips from the view.
 * Used to calculate shuffled ordering on the fly.
 */
export async function getAllPublishedClipIds(): Promise<{ id: string; display_score: number | null; created_at: string }[]> {
    const { data, error } = await supabase
        .from("ai_clips_feed")
        .select("id, display_score, created_at")
        .order("display_score", { ascending: false, nullsFirst: false });

    if (error) {
        console.error("Error fetching published clip IDs:", error);
        return [];
    }

    return data || [];
}

/**
 * Fetches full details for a batch of clip IDs, keeping the exact request ordering.
 */
export async function getClipsByIds(ids: string[]): Promise<AIClip[]> {
    if (!ids || ids.length === 0) return [];

    const { data, error } = await supabase
        .from("ai_clips_feed")
        .select("*")
        .in("id", ids);

    if (error) {
        console.error("Error fetching clips by IDs:", error);
        return [];
    }

    // Map by ID and reorder matching the requested array
    const idMap = new Map((data as AIClip[]).map(clip => [clip.id, clip]));
    return ids
        .map(id => idMap.get(id))
        .filter((clip): clip is AIClip => !!clip);
}
