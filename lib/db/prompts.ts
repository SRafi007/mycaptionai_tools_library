import { supabaseAdmin } from "@/lib/supabase/admin";
import { Prompt, PromptType } from "@/types/prompt";

const supabase = supabaseAdmin;

/**
 * Get aggregated counts of published prompts grouped by prompt type.
 */
export async function getPromptTypeCounts(): Promise<{ type: PromptType; count: number }[]> {
    const { data, error } = await supabase
        .from("prompts")
        .select("prompt_type")
        .eq("status", "published");

    if (error) {
        console.error("Error fetching prompt type counts:", error);
        return [];
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row) => {
        counts[row.prompt_type] = (counts[row.prompt_type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
        type: type as PromptType,
        count,
    }));
}

/**
 * Get trending prompts sorted by copy_count
 */
export async function getTrendingPrompts(limit: number = 9): Promise<Prompt[]> {
    const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "published")
        .order("copy_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching trending prompts:", error);
        return [];
    }

    return (data as Prompt[]) || [];
}

/**
 * Get top prompts by category, sorted by copy_count or created_at
 */
export async function getTopPromptsByType(
    promptType: PromptType,
    limit: number = 9
): Promise<Prompt[]> {
    const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "published")
        .eq("prompt_type", promptType)
        .order("copy_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error(`Error fetching top prompts for type ${promptType}:`, error);
        return [];
    }

    return (data as Prompt[]) || [];
}

export async function getPromptsPaginated(
    page: number = 1,
    limit: number = 24,
    type?: PromptType | "all"
): Promise<{ prompts: Prompt[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("prompts")
        .select("*", { count: "exact" })
        .eq("status", "published");

    if (type && type !== "all") {
        query = query.eq("prompt_type", type);
    }

    const { data, error, count } = await query
        .order("copy_count", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching prompts paginated:", error);
        return { prompts: [], total: 0 };
    }

    return { prompts: (data as Prompt[]) || [], total: count || 0 };
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
    const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !data) {
        console.error(`Error fetching prompt ${slug}:`, error);
        return null;
    }

    return data as Prompt;
}

export async function getAllPromptSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from("prompts")
        .select("slug")
        .eq("status", "published");

    if (error) {
        console.error("Error fetching prompt slugs:", error);
        return [];
    }

    return (data || []).map((p) => p.slug);
}

/**
 * Get related prompts — same prompt_type, excluding the current one.
 */
export async function getRelatedPrompts(
    currentSlug: string,
    promptType: PromptType,
    limit: number = 6
): Promise<Prompt[]> {
    const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("status", "published")
        .eq("prompt_type", promptType)
        .neq("slug", currentSlug)
        .order("copy_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching related prompts:", error);
        return [];
    }

    return (data as Prompt[]) || [];
}
