import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getAllCategorySlugs } from "@/lib/db/categories";
import { getToolsByCategory } from "@/lib/db/tools";
import Breadcrumbs from "@/components/breadcrumbs";
import ToolCard from "@/components/tool-card";
import FilterBar from "@/components/filter-bar";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import DirectAnswerCard from "@/components/direct-answer-card";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; sort?: string; pricing?: string }>;
}

const PER_PAGE = 24;
export const revalidate = 3600; // Cache for 1 hour

function toTitleCase(value: string): string {
    return value
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateStaticParams() {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { page: pageStr, sort, pricing } = await searchParams;

    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category Not Found" };

    const page = parseInt(pageStr || "1", 10) || 1;
    const hasFacetParams = page > 1 || Boolean(sort) || (pricing && pricing !== "all");

    const year = new Date().getFullYear();
    const title = category.seo_title || `Best ${toTitleCase(category.slug)} AI Tools in ${year} - Top ${category.tool_count} Ranked | ${SITE_NAME}`;
    const description = category.seo_description || `Discover top ${toTitleCase(category.slug)} AI tools. Compare features, pricing, ratings, and workflow fit across ${category.tool_count} listings.`;
    const canonical = absoluteUrl(`/category/${category.slug}`);

    return {
        title,
        description,
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
        alternates: { canonical },
        robots: hasFacetParams
            ? { index: false, follow: true }
            : { index: true, follow: true },
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { page: pageStr, sort, pricing } = await searchParams;

    const category = await getCategoryBySlug(slug);
    if (!category) notFound();

    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const currentSort = sort || "rating";
    const currentPricing = pricing || "all";

    const { tools, total } = await getToolsByCategory(category.id, currentPage, PER_PAGE, currentSort, currentPricing);
    const totalPages = Math.ceil(total / PER_PAGE);
    const categoryLabel = toTitleCase(category.slug);

    // Summary statement for AEO / GEO snippet extraction
    const categorySummary = category.description
        ? `${categoryLabel} AI tools provide automated workflows for ${category.description.toLowerCase()}. This curated directory lists ${total} tools with pricing details, user ratings, and feature breakdowns.`
        : `The ${categoryLabel} AI directory indexes ${total} verified tools designed to streamline ${categoryLabel.toLowerCase()} tasks. Compare ratings, pricing models (Free, Freemium, Paid), and key feature sets to find the right tool for your workflow.`;

    const topToolsForTable = tools.slice(0, 10);

    const faq = [
        {
            q: `What are the best ${categoryLabel} AI tools?`,
            a: `The best ${categoryLabel.toLowerCase()} tools are the ones that match your workflow, budget, and quality needs. Top ranked options include ${topToolsForTable.slice(0, 3).map((t) => t.name).join(", ")}.`,
        },
        {
            q: `Are there free ${categoryLabel} AI tools?`,
            a: "Yes. Many tools offer free tiers or freemium plans. Use the pricing filter to find free options faster.",
        },
        {
            q: `How often is this category updated?`,
            a: "This category updates regularly as new tools are verified and rating signals change.",
        },
    ];

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${categoryLabel} AI Tools`,
        numberOfItems: total,
        itemListElement: tools.map((tool, i) => ({
            "@type": "ListItem",
            position: (currentPage - 1) * PER_PAGE + i + 1,
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="container-main">
                <Breadcrumbs
                    items={[{ label: "Categories", href: "/ai-tools" }, { label: categoryLabel }]}
                    currentPath={`/category/${category.slug}`}
                />

                <div className="page-header" style={{ borderBottom: "none", marginBottom: "16px" }}>
                    <h1 className="page-title">Best {categoryLabel} AI Tools</h1>
                    <p className="page-subtitle">
                        {category.description || `Explore curated ${categoryLabel.toLowerCase()} AI tools. Compare quality, pricing, and ratings.`}
                    </p>
                    <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                        {total.toLocaleString()} tools in this category
                    </p>
                </div>

                {/* Direct Answer Overview Snippet (AEO & GEO) */}
                <DirectAnswerCard
                    title={`${categoryLabel} AI Tools Summary`}
                    summary={categorySummary}
                    badgeLabel="Category Overview"
                    highlights={[
                        { label: "Total Tools", value: total.toString() },
                        { label: "Primary Category", value: categoryLabel },
                        { label: "Pricing Options", value: "Free, Freemium, Paid" },
                    ]}
                />

                <FilterBar
                    currentSort={currentSort}
                    currentPricing={currentPricing}
                    totalCount={total}
                />

                {tools.length > 0 ? (
                    <div className="tools-grid">
                        {tools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} showVisitButton />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="empty-state-text">
                            No tools found with the current filters. Try adjusting your criteria.
                        </p>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath={`/category/${slug}`}
                />

                {/* Structured HTML Comparison Table for AEO & LLM Snippet Extraction */}
                {topToolsForTable.length > 0 && (
                    <section className="section-padding section-border-t" style={{ marginTop: "32px" }}>
                        <div className="section-header">
                            <h2 className="section-title">Top {categoryLabel} AI Tools Comparison Table</h2>
                            <span className="section-count">Quick Reference</span>
                        </div>

                        <div style={{ overflowX: "auto" }} className="card">
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "13px",
                                    textAlign: "left",
                                }}
                            >
                                <caption style={{ captionSide: "top", textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--text-muted)", fontSize: "12px" }}>
                                    Comparison matrix of top rated {categoryLabel.toLowerCase()} AI tools
                                </caption>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--border-default, #242533)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                                        <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Tool Name</th>
                                        <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Rating</th>
                                        <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Pricing Tier</th>
                                        <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Description</th>
                                        <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topToolsForTable.map((tool) => (
                                        <tr key={`table-${tool.id}`} style={{ borderBottom: "1px solid var(--border-default, #242533)" }}>
                                            <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                                                <Link href={`/tools/${tool.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                                                    {tool.name}
                                                </Link>
                                            </td>
                                            <td style={{ padding: "12px 16px", color: "var(--highlight-accent)" }}>
                                                ⭐ {(tool.rating_score || 0).toFixed(1)}
                                            </td>
                                            <td style={{ padding: "12px 16px" }}>
                                                <span className={`badge badge-${tool.pricing_type === "Free" ? "free" : tool.pricing_type === "Paid" ? "paid" : "freemium"}`}>
                                                    {tool.pricing_type || "Free"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 16px", color: "var(--text-secondary)", maxWidth: "320px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {tool.short_description || tool.description || "N/A"}
                                            </td>
                                            <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                <Link href={`/tools/${tool.slug}`} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>
                                                    Review &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                <section className="section-padding section-border-t" style={{ marginTop: "28px" }}>
                    <div className="section-header">
                        <h2 className="section-title">{categoryLabel} AI Tools FAQ</h2>
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
