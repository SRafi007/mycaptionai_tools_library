import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ToolCard from "@/components/tool-card";
import Breadcrumbs from "@/components/breadcrumbs";
import BackToTop from "@/components/back-to-top";
import { USE_CASES, USE_CASE_MAP } from "@/lib/seo/usecases";
import { getCategoriesBySlugs } from "@/lib/db/categories";
import { getToolsByCategory } from "@/lib/db/tools";
import { Tool } from "@/types/tool";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    params: Promise<{ usecase: string }>;
}

const MAX_TOOLS = 24;
const TOOLS_PER_CATEGORY = 18;
export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
    return USE_CASES.map((entry) => ({ usecase: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { usecase } = await params;
    const config = USE_CASE_MAP.get(usecase);
    if (!config) return { title: "Best AI Tools" };

    const year = new Date().getFullYear();
    const title = `${config.title} (${year}) | ${SITE_NAME}`;
    const description = `${config.description} Compare top tools, pricing models, and standout options for this workflow.`;
    const canonical = absoluteUrl(`/best/${config.slug}`);
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

function rankTools(tools: Tool[]): Tool[] {
    return [...tools].sort((a, b) => {
        if ((b.rating_score || 0) !== (a.rating_score || 0)) {
            return (b.rating_score || 0) - (a.rating_score || 0);
        }
        return (b.upvotes || 0) - (a.upvotes || 0);
    });
}

function collectTopValues(values: Array<string | null | undefined>, limit = 4): string[] {
    const counts = new Map<string, number>();

    for (const rawValue of values) {
        const value = rawValue?.trim();
        if (!value) continue;
        counts.set(value, (counts.get(value) || 0) + 1);
    }

    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, limit)
        .map(([value]) => value);
}

export default async function BestUseCasePage({ params }: PageProps) {
    const { usecase } = await params;
    const config = USE_CASE_MAP.get(usecase);
    if (!config) notFound();

    const categories = await getCategoriesBySlugs(config.categorySlugs);
    if (!categories.length) notFound();

    const toolResults = await Promise.all(
        categories.map((cat) => getToolsByCategory(cat.id, 1, TOOLS_PER_CATEGORY, "rating", "all"))
    );

    const deduped = new Map<string, Tool>();
    for (const result of toolResults) {
        for (const tool of result.tools) deduped.set(tool.id, tool);
    }

    const rankedTools = rankTools(Array.from(deduped.values())).slice(0, MAX_TOOLS);
    const verifiedCount = rankedTools.filter((tool) => tool.is_verified).length;
    const pricingBreakdown = [
        { label: "Free", count: rankedTools.filter((tool) => tool.pricing_type === "Free").length },
        { label: "Freemium", count: rankedTools.filter((tool) => tool.pricing_type === "Freemium").length },
        { label: "Paid", count: rankedTools.filter((tool) => tool.pricing_type === "Paid").length },
        { label: "Free Trial", count: rankedTools.filter((tool) => tool.pricing_type === "Free-Trial").length },
        { label: "Custom", count: rankedTools.filter((tool) => tool.pricing_type === "Contact").length },
    ].filter((entry) => entry.count > 0);
    const pricingSummary = pricingBreakdown.slice(0, 3).map((entry) => `${entry.count} ${entry.label.toLowerCase()}`).join(", ");
    const commonWorkflows = collectTopValues(rankedTools.flatMap((tool) => tool.use_cases || []), 5);
    const notablePublishers = collectTopValues(rankedTools.map((tool) => tool.publisher), 4);

    const faq = [
        {
            q: `How do you choose the best tools for ${config.title.toLowerCase()}?`,
            a: "We rank by product quality signals, user sentiment, and relevance to the use case categories listed on this page.",
        },
        {
            q: "Are free tools included?",
            a: "Yes. We include free, freemium, and paid options when they provide strong value for this specific use case.",
        },
        {
            q: "How often is this list updated?",
            a: "This page is refreshed continuously as tool listings, ratings, and upvotes change across linked categories.",
        },
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: config.title,
        numberOfItems: rankedTools.length,
        itemListElement: rankedTools.map((tool, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: tool.name,
            url: absoluteUrl(`/tools/${tool.slug}`),
        })),
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
            },
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="container-main">
                <Breadcrumbs
                    items={[
                        { label: "Best AI Tools", href: "/ai-tools" },
                        { label: config.title },
                    ]}
                    currentPath={`/best/${config.slug}`}
                />

                <div className="page-header" style={{ borderBottom: "none" }}>
                    <h1 className="page-title">{config.title}</h1>
                    <p className="page-subtitle">{config.description}</p>
                    <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>

                <section className="card" style={{ padding: "18px", marginBottom: "20px" }}>
                    <h2 className="section-title" style={{ fontSize: "18px", marginBottom: "8px" }}>How We Evaluate Tools</h2>
                    <p className="page-subtitle" style={{ maxWidth: "none" }}>
                        We prioritize tools that are relevant to this use case, have strong rating/upvote momentum, and provide clear workflow value.
                    </p>
                    <div className="tool-detail-categories" style={{ marginTop: "12px" }}>
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/category/${cat.slug}`} className="tool-detail-cat-link">
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="card" style={{ padding: "18px", marginBottom: "20px" }}>
                    <h2 className="section-title" style={{ fontSize: "18px", marginBottom: "8px" }}>Use Case Snapshot</h2>
                    <p className="page-subtitle" style={{ maxWidth: "none" }}>
                        This ranking combines {categories.length} supporting categories and {rankedTools.length} shortlisted tools for {config.title.toLowerCase()}.
                        {pricingSummary ? ` The current mix leans toward ${pricingSummary}.` : ""}
                    </p>
                    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: "12px" }}>
                        <article className="card" style={{ padding: "14px" }}>
                            <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--text-primary)" }}>Categories covered</h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                {categories.length} linked categories contribute candidates to this ranked list.
                            </p>
                        </article>
                        <article className="card" style={{ padding: "14px" }}>
                            <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--text-primary)" }}>Ranked tools</h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                {rankedTools.length} tools made the final shortlist after deduping and ranking.
                            </p>
                        </article>
                        <article className="card" style={{ padding: "14px" }}>
                            <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--text-primary)" }}>Verified listings</h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                {verifiedCount} shortlisted tools are marked as verified listings.
                            </p>
                        </article>
                        {pricingBreakdown.length > 0 && (
                            <article className="card" style={{ padding: "14px" }}>
                                <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--text-primary)" }}>Pricing mix</h3>
                                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                    {pricingBreakdown.slice(0, 3).map((entry) => `${entry.count} ${entry.label.toLowerCase()}`).join(", ")}.
                                </p>
                            </article>
                        )}
                    </div>
                    {commonWorkflows.length > 0 && (
                        <div style={{ marginTop: "14px" }}>
                            <h3 style={{ margin: "0 0 8px", fontSize: "15px", color: "var(--text-primary)" }}>Recurring workflows across these tools</h3>
                            <div className="tool-detail-categories">
                                {commonWorkflows.map((workflow) => (
                                    <span key={workflow} className="tool-detail-cat-link">{workflow}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {notablePublishers.length > 0 && (
                        <p style={{ margin: "14px 0 0", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                            Publishers that appear frequently in this shortlist include {notablePublishers.join(", ")}.
                        </p>
                    )}
                </section>

                {rankedTools.length > 0 ? (
                    <div className="tools-grid">
                        {rankedTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} showVisitButton />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="empty-state-text">No matching tools found yet for this use case.</p>
                    </div>
                )}

                <section className="section-padding section-border-t" style={{ marginTop: "28px" }}>
                    <div className="section-header">
                        <h2 className="section-title">FAQ</h2>
                    </div>
                    <div style={{ display: "grid", gap: "12px" }}>
                        {faq.map((item) => (
                            <article key={item.q} className="card" style={{ padding: "14px 16px" }}>
                                <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "var(--text-primary)" }}>{item.q}</h3>
                                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{item.a}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            <BackToTop />
        </>
    );
}
