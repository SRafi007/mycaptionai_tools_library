import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin/", "/api/"],
            },
        ],
        host: SITE_URL,
        sitemap: [
            `${SITE_URL}/sitemap.xml`,
            `${SITE_URL}/sitemaps/tools.xml`,
            `${SITE_URL}/sitemaps/categories.xml`,
            `${SITE_URL}/sitemaps/blog.xml`,
            `${SITE_URL}/sitemaps/use-cases.xml`,
            `${SITE_URL}/sitemaps/ecosystems.xml`,
            `${SITE_URL}/sitemaps/playbooks.xml`,
        ],
    };
}
