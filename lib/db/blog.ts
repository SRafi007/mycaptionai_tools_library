import { supabaseAdmin } from "@/lib/supabase/admin";

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    content_format: "markdown" | "blocks";
    content_blocks: BlogContentBlock[];
    canonical_source_url: string | null;
    cover_image_url: string | null;
    author: string;
    status: "draft" | "published" | "scheduled";
    is_featured: boolean;
    tags: string[];
    seo_title: string | null;
    seo_description: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

export type BlogContentBlock =
    | { type: "heading"; level?: 2 | 3; text: string }
    | { type: "paragraph"; text: string }
    | { type: "image"; src: string; alt?: string; caption?: string }
    | { type: "quote"; text: string; cite?: string }
    | { type: "list"; ordered?: boolean; items: string[] }
    | { type: "code"; code: string; language?: string }
    | { type: "cta"; title: string; text?: string; href?: string; label?: string }
    | { type: "divider" }
    | { type: "embed"; url: string; title?: string };

const supabase = supabaseAdmin;

// ─── Published Posts (paginated) ───
export async function getPublishedPosts(
    page: number = 1,
    perPage: number = 12
): Promise<{ posts: BlogPost[]; total: number }> {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Error fetching blog posts:", error);
        return { posts: [], total: 0 };
    }

    return { posts: (data as BlogPost[]) || [], total: count || 0 };
}

// ─── Single Post by Slug ───
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !data) return null;
    return data as BlogPost;
}

// ─── All Post Slugs (for sitemap) ───
export async function getAllPostSlugs(): Promise<string[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published");

    if (error) return [];
    return (data || []).map((p) => p.slug);
}

// ─── Featured Posts ───
export async function getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data as BlogPost[]) || [];
}

