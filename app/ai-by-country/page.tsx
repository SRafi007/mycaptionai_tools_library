import { Metadata } from "next";
import AiCountryMap from "@/components/ai-country-map";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import PageHeader from "@/components/page-header";
import landscapeRaw from "@/data/global_ai_landscape.json";
import { aggregateLandscapeByCountry, type AiLandscapeRow } from "@/lib/ai-landscape";

export const metadata: Metadata = {
    title: "Where AI Comes From - AI Innovation Map",
    description:
        "Explore where major AI tools come from using a lightweight country map. Click any country to see companies, tool highlights, and ecosystem depth.",
    alternates: {
        canonical: absoluteUrl("/ai-by-country"),
    },
    openGraph: {
        title: "Where AI Comes From - AI Innovation Map",
        description:
            "Discover AI innovation by country with an interactive map and leaderboard.",
        url: absoluteUrl("/ai-by-country"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Where AI Comes From - AI Innovation Map",
        description:
            "Discover AI innovation by country with an interactive map and leaderboard.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function AiByCountryPage() {
    const aggregated = aggregateLandscapeByCountry(landscapeRaw as AiLandscapeRow[]);
    const totalCountries = aggregated.length;
    const totalCompanies = aggregated.reduce((sum, item) => sum + item.companyCount, 0);
    const totalTools = aggregated.reduce((sum, item) => sum + item.toolCount, 0);

    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Where AI Comes From",
        url: absoluteUrl("/ai-by-country"),
        description: "Interactive country map showing where AI companies and tools originate.",
    };

    return (
        <div className="container-main country-map-page">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

            <PageHeader
                title="Where AI Innovation Starts"
                subtitle="A curated atlas of the countries shaping modern AI — explore the companies and tools driving each ecosystem."
            />
            <dl className="country-hero-stats" style={{ marginTop: "16px", marginBottom: "28px" }}>
                <div className="country-hero-stat">
                    <dt>Countries</dt>
                    <dd>{totalCountries}</dd>
                </div>
                <div className="country-hero-stat">
                    <dt>Companies</dt>
                    <dd>{totalCompanies}</dd>
                </div>
                <div className="country-hero-stat">
                    <dt>Tools tracked</dt>
                    <dd>{totalTools}</dd>
                </div>
            </dl>

            <AiCountryMap />
            <BackToTop />
        </div>
    );
}
