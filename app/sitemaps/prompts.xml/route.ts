import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: prompts, error } = await supabaseAdmin
        .from("prompts")
        .select("slug, updated_at")
        .eq("status", "published");

    if (error) {
        console.error("Failed to build prompts sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (prompts || []).map((prompt) => ({
        loc: `${SITE_URL}/prompts/${prompt.slug}`,
        lastmod: prompt.updated_at || now,
        changefreq: "weekly" as const,
        priority: 0.75,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
