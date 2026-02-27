import { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/db/categories";
import { getToolsByCategory } from "@/lib/db/tools";
import BackToTop from "@/components/back-to-top";
import { USE_CASES } from "@/lib/seo/usecases";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "Browse AI Tool Categories",
    description:
        "Explore all AI tool categories. Find the best AI tools for writing, image generation, video, marketing, coding, and more.",
    alternates: {
        canonical: absoluteUrl("/ai-tools"),
    },
    openGraph: {
        title: "Browse AI Tool Categories",
        description: "Explore all AI tool categories and discover the best AI tools by use case.",
        url: absoluteUrl("/ai-tools"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Browse AI Tool Categories",
        description: "Explore all AI tool categories and discover the best AI tools by use case.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default async function BrowsePage() {
    const categories = await getCategories();
    const totalTools = categories.reduce((sum, category) => sum + (category.tool_count || 0), 0);
    const categoryRows = await Promise.all(
        categories.map(async (category) => {
            const { tools } = await getToolsByCategory(category.id, 1, 5, "rating", "all");
            return { category, tools: tools.slice(0, 5) };
        })
    );
    const browseSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Browse AI Tool Categories",
        url: absoluteUrl("/ai-tools"),
        mainEntity: {
            "@type": "ItemList",
            itemListElement: categories.slice(0, 50).map((category, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: category.name,
                url: absoluteUrl(`/category/${category.slug}`),
            })),
        },
    };

    return (
        <div className="container-main browse-page">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(browseSchema) }} />
            <div className="page-header browse-page-header">
                <p className="browse-page-kicker">AI Tools Explorer</p>
                <h1 className="page-title">Browse All Categories</h1>
                <p className="page-subtitle">
                    Explore {categories.length} categories, preview top tools in each one, and open the full category list.
                </p>
                <div className="browse-page-metrics">
                    <span className="browse-page-metric">{categories.length.toLocaleString()} Categories</span>
                    <span className="browse-page-metric">{totalTools.toLocaleString()} Tools Indexed</span>
                </div>
            </div>

            <div className="section-padding">
                <div className="card browse-table-shell">
                    <table className="browse-category-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Top Tools (Up to 5)</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryRows.map(({ category, tools }) => (
                                <tr key={category.id}>
                                    <td>
                                        <Link href={`/category/${category.slug}`} className="browse-category-link">
                                            {category.name}
                                        </Link>
                                    </td>
                                    <td>
                                        {tools.length > 0 ? (
                                            <div className="browse-page-tool-list">
                                                {tools.map((tool) => (
                                                    <Link key={tool.id} href={`/tools/${tool.slug}`} className="tool-detail-cat-link browse-tool-pill">
                                                        {tool.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="browse-page-empty">No tools yet</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="browse-category-total">{category.tool_count.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <Link href={`/category/${category.slug}`} className="btn-ghost btn-sm browse-show-all-btn">
                                            Show all
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <section className="section-padding section-border-t">
                <div className="section-header">
                    <h2 className="section-title">Best AI Tools by Use Case</h2>
                    <span className="section-count">{USE_CASES.length} pages</span>
                </div>
                <div className="browse-usecase-grid">
                    {USE_CASES.map((useCase) => (
                        <Link key={useCase.slug} href={`/best/${useCase.slug}`} className="card browse-usecase-card">
                            <h3 className="browse-usecase-title">{useCase.title}</h3>
                            <p className="browse-usecase-desc">
                                {useCase.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
