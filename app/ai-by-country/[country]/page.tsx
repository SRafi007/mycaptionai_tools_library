import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackToTop from "@/components/back-to-top";
import landscapeRows from "@/data/global_ai_landscape.json";
import {
    aggregateLandscapeByCountry,
    getCountryBySlug,
    isoToFlag,
    type AiLandscapeRow,
} from "@/lib/ai-landscape";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    params: Promise<{ country: string }>;
}

const COUNTRY_LANDSCAPE = aggregateLandscapeByCountry(landscapeRows as AiLandscapeRow[]);

function formatDate(value: string | null): string {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function generateStaticParams() {
    return COUNTRY_LANDSCAPE.map((entry) => ({ country: entry.countrySlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { country } = await params;
    const countryEntry = getCountryBySlug(COUNTRY_LANDSCAPE, country);

    if (!countryEntry) {
        return { title: "Country Not Found" };
    }

    const title = `AI Tools from ${countryEntry.country}`;
    const description = `Explore ${countryEntry.toolCount} AI tools and ${countryEntry.companyCount} companies from ${countryEntry.country}.`;
    const canonical = absoluteUrl(`/ai-by-country/${countryEntry.countrySlug}`);

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
    };
}

export default async function CountryLandscapePage({ params }: PageProps) {
    const { country } = await params;
    const countryEntry = getCountryBySlug(COUNTRY_LANDSCAPE, country);

    if (!countryEntry) notFound();

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `AI Tools from ${countryEntry.country}`,
        numberOfItems: countryEntry.tools.length,
        itemListElement: countryEntry.tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: tool.slug ? absoluteUrl(`/tools/${tool.slug}`) : undefined,
        })),
    };

    return (
        <div className="container-main country-detail-page">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

            <div className="page-header country-detail-header">
                <p className="country-map-kicker">Country Deep Dive</p>
                <h1 className="page-title">
                    {isoToFlag(countryEntry.iso)} AI Tools from {countryEntry.country}
                </h1>
                <p className="page-subtitle">
                    {countryEntry.companyCount} companies and {countryEntry.toolCount} known tools in this snapshot.
                </p>
                <div className="country-detail-meta">
                    <span className="country-map-metric-chip">
                        First tool date: {formatDate(countryEntry.firstPublishedOn)}
                    </span>
                    <span className="country-map-metric-chip">
                        Latest tool date: {formatDate(countryEntry.lastPublishedOn)}
                    </span>
                </div>
                <div style={{ marginTop: "14px" }}>
                    <Link href="/ai-by-country" className="btn-ghost btn-sm">
                        Back to AI Innovation Map
                    </Link>
                </div>
            </div>

            <section className="section-padding">
                <div className="section-header">
                    <h2 className="section-title">Tool Directory</h2>
                    <span className="section-count">{countryEntry.tools.length} tools</span>
                </div>
                <div className="country-detail-tools-grid">
                    {countryEntry.tools.map((tool) =>
                        tool.slug ? (
                            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="card country-detail-tool-card">
                                <h3>{tool.name}</h3>
                                <p>Open profile</p>
                            </Link>
                        ) : (
                            <article key={tool.name} className="card country-detail-tool-card">
                                <h3>{tool.name}</h3>
                                <p>Profile coming soon</p>
                            </article>
                        )
                    )}
                </div>
            </section>

            <section className="section-padding section-border-t">
                <div className="section-header">
                    <h2 className="section-title">AI Companies</h2>
                    <span className="section-count">{countryEntry.companies.length} companies</span>
                </div>
                <div className="country-detail-company-grid">
                    {countryEntry.companies.map((company) => (
                        <article key={company.name} className="card country-detail-company-card">
                            <h3>{company.name}</h3>
                        </article>
                    ))}
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
