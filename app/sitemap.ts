import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { USE_CASES } from "@/lib/seo/usecases";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    try {
        const [{ data: tools }, { data: categories }, { data: blogPosts }] = await Promise.all([
            supabaseAdmin.from("tools").select("slug, updated_at"),
            supabaseAdmin.from("categories").select("slug, updated_at"),
            supabaseAdmin.from("blog_posts").select("slug, updated_at").eq("status", "published"),
        ]);

        const toolEntries: MetadataRoute.Sitemap = (tools || []).map((tool) => ({
            url: `${SITE_URL}/tools/${tool.slug}`,
            lastModified: tool.updated_at ? new Date(tool.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.7,
        }));

        const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((category) => ({
            url: `${SITE_URL}/category/${category.slug}`,
            lastModified: category.updated_at ? new Date(category.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        const blogEntries: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.updated_at ? new Date(post.updated_at) : now,
            changeFrequency: "weekly",
            priority: 0.65,
        }));

        const staticEntries: MetadataRoute.Sitemap = [
            { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
            { url: `${SITE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
            { url: `${SITE_URL}/top-rated`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
            { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
            { url: `${SITE_URL}/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.45 },
            { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
            { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.25 },
            { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.25 },
        ];

        const useCaseEntries: MetadataRoute.Sitemap = USE_CASES.map((entry) => ({
            url: `${SITE_URL}/best/${entry.slug}`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.75,
        }));

        return [...staticEntries, ...useCaseEntries, ...categoryEntries, ...blogEntries, ...toolEntries];
    } catch (error) {
        console.error("Critical error generating sitemap:", error);
        return [
            { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
            { url: `${SITE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
            { url: `${SITE_URL}/top-rated`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
            { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
            { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
        ];
    }
}
