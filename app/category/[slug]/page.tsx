import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, getAllCategorySlugs, getTopCategories } from "@/lib/db/categories";
import { getToolsByCategory } from "@/lib/db/tools";
import Breadcrumbs from "@/components/breadcrumbs";
import ToolCard from "@/components/tool-card";
import FilterBar from "@/components/filter-bar";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; sort?: string; pricing?: string }>;
}

const PER_PAGE = 24;
export const revalidate = 60;

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
    const description = category.seo_description || `Discover top ${toTitleCase(category.slug)} AI tools. Compare features, pricing, ratings, and use-case fit.`;
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

    const [{ tools, total }, topCategories] = await Promise.all([
        getToolsByCategory(category.id, currentPage, PER_PAGE, currentSort, currentPricing),
        getTopCategories(12),
    ]);

    const relatedCategories = topCategories.filter((cat) => cat.slug !== category.slug).slice(0, 6);
    const totalPages = Math.ceil(total / PER_PAGE);
    const categoryLabel = toTitleCase(category.slug);

    const faq = [
        {
            q: `What are the best ${categoryLabel} AI tools?`,
            a: `The best ${categoryLabel.toLowerCase()} tools are the ones that match your workflow, budget, and quality needs. Use ratings, pricing, and feature fit to decide.`,
        },
        {
            q: `Are there free ${categoryLabel} AI tools?`,
            a: "Yes. Many tools offer free tiers or freemium plans. Use the pricing filter to find free options faster.",
        },
        {
            q: `How often is this category updated?`,
            a: "This category updates as new tools are added and ranking signals change.",
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
                    items={[{ label: "Categories", href: "/browse" }, { label: categoryLabel }]}
                    currentPath={`/category/${category.slug}`}
                />

                <div className="page-header" style={{ borderBottom: "none" }}>
                    <h1 className="page-title">Best {categoryLabel} AI Tools</h1>
                    <p className="page-subtitle">
                        {category.description || `Explore curated ${categoryLabel.toLowerCase()} AI tools. Compare quality, pricing, and ratings.`}
                    </p>
                    <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                        {total.toLocaleString()} tools in this category
                    </p>
                </div>

                <section className="card" style={{ padding: "18px", marginBottom: "20px" }}>
                    <h2 className="section-title" style={{ fontSize: "18px", marginBottom: "8px" }}>How We Rank These Tools</h2>
                    <p className="page-subtitle" style={{ maxWidth: "none" }}>
                        Rankings combine rating quality, upvote momentum, and category relevance. Use filters to narrow by pricing and sort by your preferred signal.
                    </p>
                    {relatedCategories.length > 0 && (
                        <div className="tool-detail-categories" style={{ marginTop: "12px" }}>
                            {relatedCategories.map((cat) => (
                                <Link key={cat.id} href={`/category/${cat.slug}`} className="tool-detail-cat-link">
                                    {toTitleCase(cat.slug)}
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

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
