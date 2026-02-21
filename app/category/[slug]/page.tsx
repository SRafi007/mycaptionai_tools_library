import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getAllCategorySlugs } from "@/lib/db/categories";
import { getToolsByCategory } from "@/lib/db/tools";
import Breadcrumbs from "@/components/breadcrumbs";
import ToolCard from "@/components/tool-card";
import FilterBar from "@/components/filter-bar";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string; sort?: string; pricing?: string }>;
}

export async function generateStaticParams() {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return { title: "Category Not Found" };

    const title = category.seo_title || `Best ${category.name} AI Tools in 2026 — Top ${category.tool_count} Ranked | MyCaptionAI`;
    const description = category.seo_description || `Discover the best ${category.name.toLowerCase()} AI tools. Compare ${category.tool_count} tools with ratings, reviews, and pricing. Updated daily.`;

    return {
        title,
        description,
        openGraph: { title, description },
    };
}

const PER_PAGE = 24;

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const { page: pageStr, sort, pricing } = await searchParams;

    const category = await getCategoryBySlug(slug);
    if (!category) notFound();

    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const currentSort = sort || "rating";
    const currentPricing = pricing || "all";

    const { tools, total } = await getToolsByCategory(
        category.id,
        currentPage,
        PER_PAGE,
        currentSort,
        currentPricing
    );

    const totalPages = Math.ceil(total / PER_PAGE);

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${category.name} AI Tools`,
        numberOfItems: total,
        itemListElement: tools.map((tool, i) => ({
            "@type": "ListItem",
            position: (currentPage - 1) * PER_PAGE + i + 1,
            name: tool.name,
            url: `https://mycaptionai.com/tools/${tool.slug}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container-main">
                <Breadcrumbs items={[{ label: "Categories", href: "/browse" }, { label: category.name }]} />

                <div className="page-header" style={{ borderBottom: "none" }}>
                    <h1 className="page-title">{category.name} AI Tools</h1>
                    <p className="page-subtitle">
                        {category.description || `Explore the best ${category.name.toLowerCase()} AI tools. Compare features, pricing, and user ratings.`}
                    </p>
                </div>

                <FilterBar
                    currentSort={currentSort}
                    currentPricing={currentPricing}
                    totalCount={total}
                />

                {tools.length > 0 ? (
                    <div className="tools-grid">
                        {tools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
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
            </div>

            <BackToTop />
        </>
    );
}
