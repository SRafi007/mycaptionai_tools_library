import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";
import { buildSitemapXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date();
    const { data: playbooks, error } = await supabaseAdmin
        .from("playbooks")
        .select("slug, created_at")
        .eq("is_published", true);

    if (error) {
        console.error("Failed to build playbooks sitemap:", error);
        return xmlResponse(buildSitemapXml([]));
    }

    const entries = (playbooks || []).map((pb) => ({
        loc: `${SITE_URL}/playbooks/${pb.slug}`,
        lastmod: pb.created_at || now,
        changefreq: "weekly" as const,
        priority: 0.8,
    }));

    return xmlResponse(buildSitemapXml(entries));
}
