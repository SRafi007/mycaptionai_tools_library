import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SITE_URL = "https://mycaptionai.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        // Fetch all tool slugs
        const { data: tools, error: toolErr } = await supabaseAdmin.from("tools").select("slug, updated_at");
        if (toolErr) console.error("Sitemap Tools Error:", toolErr);
        const toolEntries: MetadataRoute.Sitemap = (tools || []).map((t) => ({
            url: `${SITE_URL}/tools/${t.slug}`,
            lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        }));

        // Fetch all category slugs
        const { data: categories, error: catErr } = await supabaseAdmin.from("categories").select("slug, updated_at");
        if (catErr) console.error("Sitemap Categories Error:", catErr);
        const categoryEntries: MetadataRoute.Sitemap = (categories || []).map((c) => ({
            url: `${SITE_URL}/category/${c.slug}`,
            lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        // Fetch published blog post slugs
        const { data: blogPosts, error: blogErr } = await supabaseAdmin
            .from("blog_posts")
            .select("slug, updated_at")
            .eq("status", "published");
        if (blogErr) console.error("Sitemap Blog Posts Error:", blogErr);
        const blogEntries: MetadataRoute.Sitemap = (blogPosts || []).map((p) => ({
            url: `${SITE_URL}/blog/${p.slug}`,
            lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
        }));

        // Static pages
        const staticPages: MetadataRoute.Sitemap = [
            { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
            { url: `${SITE_URL}/browse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
            { url: `${SITE_URL}/top-rated`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
            { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
            { url: `${SITE_URL}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
            { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        ];

        return [...staticPages, ...categoryEntries, ...blogEntries, ...toolEntries];
    } catch (e) {
        console.error("Critical error generating sitemap:", e);
        // Fallback robust static pages to prevent Vercel build failing on DB errors
        return [
            { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
            { url: `${SITE_URL}/browse`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
            { url: `${SITE_URL}/top-rated`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
            { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
            { url: `${SITE_URL}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
            { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
        ];
    }
}
