import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: posts, error } = await supabaseAdmin
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .is("canonical_source_url", null);

    if (error) {
        console.error("Failed to build blog sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (posts || []).map((post) => ({
        loc: `${SITE_URL}/blog/${post.slug}`,
        lastmod: post.updated_at || now,
        changefreq: "weekly" as const,
        priority: 0.65,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
