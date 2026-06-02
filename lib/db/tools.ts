import { supabaseAdmin } from "@/lib/supabase/admin";
import { Tool, ToolWithCategories } from "@/types/tool";

// Use the admin client for all queries since tools data is public
// and we need this to work at build time (generateStaticParams)
const supabase = supabaseAdmin;

// ─── All Tools (paginated) ───
export async function getToolsPaginated(
    page: number = 1,
    perPage: number = 24,
    sort: string = "rating",
    pricing?: string
): Promise<{ tools: Tool[]; total: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase.from("tools").select("*", { count: "exact" }).eq("status", "active");

    if (pricing && pricing !== "all") {
        query = query.eq("pricing_type", pricing);
    }

    if (sort === "rating") {
        query = query.order("rating_score", { ascending: false });
    } else if (sort === "upvotes") {
        query = query.order("upvotes", { ascending: false });
    } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
    } else if (sort === "name") {
        query = query.order("name", { ascending: true });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching tools:", error);
        return { tools: [], total: 0 };
    }

    return { tools: (data as Tool[]) || [], total: count || 0 };
}

// ─── Single Tool by Slug ───
export async function getToolBySlug(slug: string): Promise<ToolWithCategories | null> {
    const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .single();

    if (error || !data) {
        console.error(`Error fetching tool ${slug}:`, error);
        return null;
    }

    // Fetch categories for this tool
    const { data: catData } = await supabase
        .from("tool_categories")
        .select("categories(id, name, slug)")
        .eq("tool_id", data.id);

    const categories = (catData || [])
        .map((r: any) => r.categories)
        .filter(Boolean);

    return { ...data, categories } as ToolWithCategories;
}

// ─── Tools by Category (paginated) ───
export async function getToolsByCategory(
    categoryId: string,
    page: number = 1,
    perPage: number = 24,
    sort: string = "rating",
    pricing?: string
): Promise<{ tools: Tool[]; total: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get tool IDs for category
    const { data: relations } = await supabase
        .from("tool_categories")
        .select("tool_id")
        .eq("category_id", categoryId);

    if (!relations || relations.length === 0) {
        return { tools: [], total: 0 };
    }

    const toolIds = relations.map((r) => r.tool_id);

    let query = supabase
        .from("tools")
        .select("*", { count: "exact" })
        .in("id", toolIds)
        .eq("status", "active");

    if (pricing && pricing !== "all") {
        query = query.eq("pricing_type", pricing);
    }

    if (sort === "rating") {
        query = query.order("rating_score", { ascending: false });
    } else if (sort === "upvotes") {
        query = query.order("upvotes", { ascending: false });
    } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching tools by category:", error);
        return { tools: [], total: 0 };
    }

    return { tools: (data as Tool[]) || [], total: count || 0 };
}

// ─── Featured Tools ───
export async function getFeaturedTools(limit: number = 6): Promise<Tool[]> {
    const { data, error } = await supabase
        .from("featured_tools")
        .select("tools!inner(*)")
        .eq("tools.status", "active")
        .order("display_order", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Error fetching featured tools:", error);
        return [];
    }

    return (data || []).map((r: any) => r.tools).filter(Boolean) as Tool[];
}

// ─── Trending Tools (by display_order) ───
export async function getTrendingTools(limit: number = 6): Promise<Tool[]> {
    const { data, error } = await supabase
        .from("trending_tools")
        .select("tools!inner(*)")
        .eq("tools.status", "active")
        .order("display_order", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Error fetching trending tools:", error);
        return [];
    }

    return (data || []).map((r: any) => r.tools).filter(Boolean) as Tool[];
}

// ─── Top Rated Tools ───
export async function getTopRatedTools(limit: number = 50): Promise<Tool[]> {
    const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("status", "active")
        .gt("rating_score", 0)
        .order("rating_score", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching top rated tools:", error);
        return [];
    }

    return (data as Tool[]) || [];
}

// ─── Search (full-text with ilike fallback) ───
export async function getTopUpvotedTools(limit: number = 50): Promise<Tool[]> {
    const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("status", "active")
        .order("upvotes", { ascending: false })
        .order("rating_score", { ascending: false })
        .order("rating_count", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching top upvoted tools:", error);
        return [];
    }

    return (data as Tool[]) || [];
}

export async function searchTools(
    query: string,
    page: number = 1,
    perPage: number = 24
): Promise<{ tools: Tool[]; total: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // 1. Try PostgreSQL full-text search first (fast, uses GIN index)
    const ftsQuery = query.trim().split(/\s+/).join(" & ");
    const { data, error, count } = await supabase
        .from("tools")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .textSearch("search_vector", ftsQuery, { type: "plain", config: "english" })
        .order("rating_score", { ascending: false })
        .range(from, to);

    if (!error && data && data.length > 0) {
        logSearch(query, count || data.length);
        return { tools: data as Tool[], total: count || 0 };
    }

    // 2. Fallback: ilike on name + short_description for partial/fuzzy matches
    const { data: fallback, error: fbErr, count: fbCount } = await supabase
        .from("tools")
        .select("*", { count: "exact" })
        .eq("status", "active")
        .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`)
        .order("rating_score", { ascending: false })
        .range(from, to);

    if (fbErr) {
        console.error("Error searching tools:", fbErr);
        return { tools: [], total: 0 };
    }

    logSearch(query, fbCount || 0);
    return { tools: (fallback as Tool[]) || [], total: fbCount || 0 };
}

// ─── Quick Search Suggestions (for typeahead) ───
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<{ name: string; slug: string; pricing_type: string | null }[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
        .from("tools")
        .select("name, slug, pricing_type")
        .eq("status", "active")
        .ilike("name", `%${query}%`)
        .order("rating_score", { ascending: false })
        .limit(limit);

    if (error) return [];
    return data || [];
}

// ─── Log Search Query ───
async function logSearch(query: string, resultsCount: number) {
    try {
        await supabase.from("search_logs").insert({
            query,
            results_count: resultsCount,
        });
    } catch {
        // non-critical, don't block response
    }
}

// ─── Similar Tools ───
export async function getSimilarTools(
    toolId: string,
    categoryIds: string[],
    limit: number = 6
): Promise<Tool[]> {
    if (categoryIds.length === 0) return [];

    // Get tools in the same categories
    const { data: relations } = await supabase
        .from("tool_categories")
        .select("tool_id")
        .in("category_id", categoryIds)
        .neq("tool_id", toolId);

    if (!relations || relations.length === 0) return [];

    const toolIds = [...new Set(relations.map((r) => r.tool_id))].slice(0, limit);

    const { data, error } = await supabase
        .from("tools")
        .select("*")
        .in("id", toolIds)
        .eq("status", "active")
        .order("rating_score", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching similar tools:", error);
        return [];
    }

    return (data as Tool[]) || [];
}

// ─── All Tool Slugs (for static generation) ───
export async function getAllToolSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from("tools")
        .select("slug")
        .eq("status", "active");

    if (error) {
        console.error("Error fetching tool slugs:", error);
        return [];
    }

    return (data || []).map((t) => t.slug);
}

// ─── Increment Tool Upvotes ───
export async function incrementToolUpvotes(toolId: string): Promise<number | null> {
    const { data, error } = await supabase
        .from("tools")
        .select("upvotes")
        .eq("id", toolId)
        .single();

    if (error || !data) {
        console.error(`Error fetching upvotes for tool ${toolId}:`, error);
        return null;
    }

    const nextUpvoteCount = (data.upvotes || 0) + 1;
    const { error: updateError } = await supabase
        .from("tools")
        .update({ upvotes: nextUpvoteCount })
        .eq("id", toolId);

    if (updateError) {
        console.error(`Error incrementing upvotes for tool ${toolId}:`, updateError);
        return null;
    }

    return nextUpvoteCount;
}

// ─── Tool Count ───
export async function getToolCount(): Promise<number> {
    const { count, error } = await supabase
        .from("tools")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

    if (error) return 0;
    return count || 0;
}

// ─── Sponsored Tool (with featured fallback) ───
export async function getSponsoredTool(): Promise<Tool | null> {
    const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("status", "active")
        .eq("is_sponsored", true)
        .order("sponsored_rank", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching sponsored tool:", error);
        return null;
    }

    if (!data) {
        // Fallback to a featured tool
        const { data: featured } = await supabase
            .from("tools")
            .select("*")
            .eq("status", "active")
            .eq("is_featured", true)
            .limit(1)
            .maybeSingle();
        return featured as Tool | null;
    }

    return data as Tool;
}
