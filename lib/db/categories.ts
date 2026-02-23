import { supabaseAdmin } from "@/lib/supabase/admin";
import { Category } from "@/types/category";

const supabase = supabaseAdmin;

// ─── All Categories (sorted by tool_count) ───
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("tool_count", { ascending: false });

    if (error) {
        console.error("Error fetching categories:", error);
        return [];
    }

    return (data as Category[]) || [];
}

// ─── Single Category by Slug ───
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return null;
    }

    return data as Category;
}

// ─── Top Categories (for homepage) ───
export async function getTopCategories(limit: number = 12): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .gt("tool_count", 0)
        .order("tool_count", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching top categories:", error);
        return [];
    }

    return (data as Category[]) || [];
}

// ─── Trending Categories ───
export async function getTrendingCategories(limit: number = 10): Promise<Category[]> {
    const { data, error } = await supabase
        .from("trending_categories")
        .select("categories(*)")
        .order("display_order", { ascending: true })
        .limit(limit);

    if (error) {
        console.error("Error fetching trending categories:", error);
        return [];
    }

    type TrendingCategoryRow = { categories: Category | Category[] | null };
    const rows = ((data || []) as unknown) as TrendingCategoryRow[];
    return rows
        .map((row) => (Array.isArray(row.categories) ? row.categories[0] : row.categories))
        .filter((category): category is Category => Boolean(category));
}

// ─── All Category Slugs (for static generation) ───
export async function getAllCategorySlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("slug");

    if (error) {
        console.error("Error fetching category slugs:", error);
        return [];
    }

    return (data || []).map((c) => c.slug);
}

// ─── Categories by Slugs ───
export async function getCategoriesBySlugs(slugs: string[]): Promise<Category[]> {
    if (!slugs.length) return [];

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .in("slug", slugs);

    if (error) {
        console.error("Error fetching categories by slugs:", error);
        return [];
    }

    return (data as Category[]) || [];
}
