import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: ecosystems, error } = await supabaseAdmin
        .from("ecosystems")
        .select("slug, created_at");

    if (error) {
        console.error("Failed to build ecosystems sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (ecosystems || []).map((eco) => ({
        loc: `${SITE_URL}/ecosystems/${eco.slug}`,
        lastmod: eco.created_at || now,
        changefreq: "weekly" as const,
        priority: 0.8,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
