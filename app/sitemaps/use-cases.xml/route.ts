import { SITE_URL } from "@/lib/seo";
import { USE_CASES } from "@/lib/seo/usecases";
import { buildSitemapXml, type SitemapUrlEntry, xmlResponse } from "@/lib/seo/sitemaps";
import landscapeRows from "@/data/global_ai_landscape.json";
import { aggregateLandscapeByCountry, type AiLandscapeRow } from "@/lib/ai-landscape";

export const revalidate = 3600;

const CORE_ENTRIES: Array<{ path: string; changefreq: SitemapUrlEntry["changefreq"]; priority: number }> = [
    { path: "/", changefreq: "daily", priority: 1.0 },
    { path: "/ai-tools", changefreq: "daily", priority: 0.95 },
    { path: "/ai-by-country", changefreq: "weekly", priority: 0.85 },
    { path: "/top-rated", changefreq: "daily", priority: 0.85 },
    { path: "/blog", changefreq: "daily", priority: 0.8 },
    { path: "/submit", changefreq: "monthly", priority: 0.45 },
    { path: "/about", changefreq: "monthly", priority: 0.4 },
    { path: "/privacy", changefreq: "yearly", priority: 0.25 },
    { path: "/terms", changefreq: "yearly", priority: 0.25 },
];

export async function GET() {
    const now = new Date();
    const countries = aggregateLandscapeByCountry(landscapeRows as AiLandscapeRow[]);

    const coreEntries: SitemapUrlEntry[] = CORE_ENTRIES.map((entry) => ({
        loc: `${SITE_URL}${entry.path}`,
        lastmod: now,
        changefreq: entry.changefreq,
        priority: entry.priority,
    }));

    const useCaseEntries: SitemapUrlEntry[] = USE_CASES.map((entry) => ({
        loc: `${SITE_URL}/best/${entry.slug}`,
        lastmod: now,
        changefreq: "weekly",
        priority: 0.75,
    }));

    const countryEntries: SitemapUrlEntry[] = countries.map((entry) => ({
        loc: `${SITE_URL}/ai-by-country/${entry.countrySlug}`,
        lastmod: now,
        changefreq: "weekly",
        priority: 0.72,
    }));

    return xmlResponse(buildSitemapXml([...coreEntries, ...useCaseEntries, ...countryEntries]));
}
