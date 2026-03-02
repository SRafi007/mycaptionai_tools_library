import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: categories, error } = await supabaseAdmin
        .from("categories")
        .select("slug, updated_at");

    if (error) {
        console.error("Failed to build categories sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (categories || []).map((category) => ({
        loc: `${SITE_URL}/category/${category.slug}`,
        lastmod: category.updated_at || now,
        changefreq: "weekly" as const,
        priority: 0.8,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
