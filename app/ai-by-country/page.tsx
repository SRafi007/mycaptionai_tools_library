import { Metadata } from "next";
import AiCountryMap from "@/components/ai-country-map";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

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
            <div className="page-header country-map-header">
                <h1 className="page-title">Where AI Innovation Starts</h1>
            </div>

            <AiCountryMap />
            <BackToTop />
        </div>
    );
}
