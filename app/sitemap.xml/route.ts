import { SITE_URL } from "@/lib/seo";
import { buildSitemapIndexXml, xmlResponse } from "@/lib/seo/sitemaps";

export const revalidate = 3600;

const CHILD_SITEMAPS = [
    `${SITE_URL}/sitemaps/tools.xml`,
    `${SITE_URL}/sitemaps/categories.xml`,
    `${SITE_URL}/sitemaps/blog.xml`,
    `${SITE_URL}/sitemaps/use-cases.xml`,
];

export async function GET() {
    const now = new Date();
    const xml = buildSitemapIndexXml(
        CHILD_SITEMAPS.map((loc) => ({
            loc,
            lastmod: now,
        }))
    );
    return xmlResponse(xml);
}
