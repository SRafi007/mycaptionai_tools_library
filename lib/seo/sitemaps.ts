export interface SitemapUrlEntry {
    loc: string;
    lastmod?: string | Date;
    changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority?: number;
}

export interface SitemapIndexEntry {
    loc: string;
    lastmod?: string | Date;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function toIso(value?: string | Date): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
}

export function buildSitemapXml(entries: SitemapUrlEntry[]): string {
    const rows = entries
        .map((entry) => {
            const lastmod = toIso(entry.lastmod);
            const changefreq = entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : "";
            const priority = typeof entry.priority === "number" ? `<priority>${entry.priority.toFixed(1)}</priority>` : "";
            return [
                "<url>",
                `<loc>${escapeXml(entry.loc)}</loc>`,
                lastmod ? `<lastmod>${lastmod}</lastmod>` : "",
                changefreq,
                priority,
                "</url>",
            ]
                .filter(Boolean)
                .join("");
        })
        .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        rows +
        `</urlset>`;
}

export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
    const rows = entries
        .map((entry) => {
            const lastmod = toIso(entry.lastmod);
            return [
                "<sitemap>",
                `<loc>${escapeXml(entry.loc)}</loc>`,
                lastmod ? `<lastmod>${lastmod}</lastmod>` : "",
                "</sitemap>",
            ]
                .filter(Boolean)
                .join("");
        })
        .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>` +
        `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
        rows +
        `</sitemapindex>`;
}

export function xmlResponse(xml: string): Response {
    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
