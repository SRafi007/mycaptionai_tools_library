import { Metadata } from "next";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    getToolBySlug,
    getSimilarTools,
    getAllToolSlugs,
    incrementToolUpvotes,
} from "@/lib/db/tools";
import Breadcrumbs from "@/components/breadcrumbs";
import RatingStars from "@/components/rating-stars";
import ToolCard from "@/components/tool-card";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
    const slugs = await getAllToolSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const tool = await getToolBySlug(slug);
    if (!tool) return { title: "Tool Not Found" };

    const pricing = tool.pricing_type || "Free";
    const category = tool.categories?.[0]?.name || "AI";
    const title = `${tool.name} - ${pricing} ${category} Tool | ${SITE_NAME}`;
    const description =
        tool.short_description || tool.description || `Discover ${tool.name}, a ${pricing.toLowerCase()} ${category.toLowerCase()} AI tool on MyCaptionAI.`;
    const canonical = absoluteUrl(`/tools/${tool.slug}`);
    const socialImage = tool.image_url || absoluteUrl(DEFAULT_OG_IMAGE_PATH);

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            images: [socialImage],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [socialImage],
        },
    };
}

export default async function ToolDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const tool = await getToolBySlug(slug);
    if (!tool) notFound();

    const categoryIds = tool.categories.map((c) => c.id);
    const similarTools = await getSimilarTools(tool.id, categoryIds, 6);
    const longDescription = tool.long_description || tool.description || tool.short_description || "No description available.";
    const hasBanner = Boolean(tool.image_url);
    const toolId = tool.id;
    const toolSlug = tool.slug;

    async function upvoteTool() {
        "use server";

        await incrementToolUpvotes(toolId);
        revalidatePath(`/tools/${toolSlug}`);
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description || tool.short_description,
        url: tool.url,
        applicationCategory: tool.categories?.[0]?.name || "AI Tool",
        offers: {
            "@type": "Offer",
            price: tool.pricing_type === "Free" ? "0" : undefined,
            priceCurrency: "USD",
        },
        aggregateRating: tool.rating_score > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: tool.rating_score.toString(),
                ratingCount: tool.rating_count.toString(),
                bestRating: "5",
            }
            : undefined,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container-main">
                <Breadcrumbs
                    items={[
                        ...(tool.categories.length > 0
                            ? [{ label: tool.categories[0].name, href: `/category/${tool.categories[0].slug}` }]
                            : []),
                        { label: tool.name },
                    ]}
                    currentPath={`/tools/${tool.slug}`}
                />

                <div className={`tool-detail-layout ${!hasBanner ? "tool-detail-layout-no-banner" : ""}`}>
                    <div className="tool-detail-content">
                        <div className="tool-detail-header">
                            <div className="tool-detail-identity">
                                <div
                                    className="tool-detail-icon"
                                    style={{
                                        background:
                                            tool.icon_url || tool.image_url
                                                ? `url(${tool.icon_url || tool.image_url}) center/cover`
                                                : "var(--accent-muted)",
                                    }}
                                >
                                    {!tool.icon_url && !tool.image_url && (
                                        <span>{tool.name.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="tool-detail-name">{tool.name}</h1>
                                    <div className="tool-detail-meta">
                                        {tool.rating_score > 0 && (
                                            <RatingStars score={tool.rating_score} count={tool.rating_count} />
                                        )}
                                        <span className="tool-card-upvotes" style={{ fontSize: "13px" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M12 19V5M5 12l7-7 7 7" />
                                            </svg>
                                            {tool.upvotes || 0} upvotes
                                        </span>
                                        {tool.pricing_type && (
                                            <span className={`badge badge-${tool.pricing_type === "Free" ? "free" : tool.pricing_type === "Paid" ? "paid" : "freemium"}`}>
                                                {tool.pricing_type}
                                            </span>
                                        )}
                                        {tool.is_verified && (
                                            <span className="tool-card-verified" style={{ fontSize: "13px" }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="tool-detail-actions">
                                <form action={upvoteTool}>
                                    <button type="submit" className="btn-outline btn-sm tool-upvote-btn tool-detail-action-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 19V5M5 12l7-7 7 7" />
                                        </svg>
                                        Upvote ({tool.upvotes || 0})
                                    </button>
                                </form>
                                {tool.url && (
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm tool-detail-action-btn">
                                        Visit Tool -&gt;
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="tool-detail-long-desc">
                            {longDescription
                                .split(/\n+/)
                                .filter((paragraph) => paragraph.trim().length > 0)
                                .map((paragraph, index) => (
                                    <p key={`${tool.id}-desc-${index}`}>{paragraph.trim()}</p>
                                ))}
                        </div>

                        {tool.publisher && (
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
                                Published by <strong style={{ color: "var(--text-secondary)" }}>{tool.publisher}</strong>
                            </p>
                        )}

                        {tool.categories.length > 0 && (
                            <div className="tool-detail-categories">
                                {tool.categories.map((cat) => (
                                    <Link key={cat.id} href={`/category/${cat.slug}`} className="tool-detail-cat-link">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {hasBanner && (
                        <div className="tool-detail-banner">
                            <img
                                src={tool.image_url || ""}
                                alt={`${tool.name} screenshot`}
                                loading="lazy"
                            />
                        </div>
                    )}
                </div>

                {similarTools.length > 0 && (
                    <section className="section-padding section-border-t" style={{ marginTop: "40px" }}>
                        <div className="section-header">
                            <h2 className="section-title">Similar Tools</h2>
                            <span className="section-count">{similarTools.length} tools</span>
                        </div>
                        <div className="tools-grid">
                            {similarTools.map((t) => (
                                <ToolCard key={t.id} tool={t} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <BackToTop />
        </>
    );
}
