import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: tools, error } = await supabaseAdmin
        .from("tools")
        .select("slug, updated_at")
        .eq("status", "active");

    if (error) {
        console.error("Failed to build tools sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (tools || []).map((tool) => ({
        loc: `${SITE_URL}/tools/${tool.slug}`,
        lastmod: tool.updated_at || now,
        changefreq: "weekly" as const,
        priority: 0.7,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
