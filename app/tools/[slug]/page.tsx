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
import ToolDetailVisual from "@/components/tool-detail-visual";
import StickyToolBar from "@/components/sticky-tool-bar";
import ToolPreviewImage from "@/components/tool-preview-image";
import DirectAnswerCard from "@/components/direct-answer-card";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH, localCanonicalUrl } from "@/lib/seo";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Cache for 1 hour

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
    const title = tool.seo_title || `${tool.name} Review, Pricing & Features`;
    const description = tool.seo_description
        || tool.short_description
        || tool.description
        || `${tool.name} is a ${pricing.toLowerCase()} ${category.toLowerCase()} AI tool. Compare features, pricing, ratings, and alternatives on ${SITE_NAME}.`;
    const canonical = localCanonicalUrl(tool.canonical_url, `/tools/${tool.slug}`);
    const socialImage = tool.image_url || tool.icon_url || absoluteUrl(DEFAULT_OG_IMAGE_PATH);
    const socialImageAlt = `${tool.name} AI tool listing on ${SITE_NAME}`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            images: [{ url: socialImage, alt: socialImageAlt }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [socialImage],
        },
    };
}

function formatPricingLabel(pricingType: string | null | undefined): string {
    switch (pricingType) {
        case "Free-Trial":
            return "Free trial";
        case "Freemium":
            return "Freemium";
        case "Paid":
            return "Paid";
        case "Contact":
            return "Custom pricing";
        case "Free":
        default:
            return "Free";
    }
}

function sanitizeList(values: string[] | null | undefined, limit = 6): string[] {
    if (!Array.isArray(values)) return [];
    return values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
        .slice(0, limit);
}

export default async function ToolDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const tool = await getToolBySlug(slug);
    if (!tool) notFound();

    const categoryIds = tool.categories.map((c) => c.id);
    const similarTools = await getSimilarTools(tool.id, categoryIds, 6);
    const primaryCategory = tool.categories[0] || null;
    const longDescription = tool.long_description || tool.description || tool.short_description || "No description available.";
    const toolId = tool.id;
    const toolSlug = tool.slug;
    const featureList = sanitizeList(tool.features);
    const useCaseList = sanitizeList(tool.use_cases);
    const pros = sanitizeList(tool.pros_cons?.pros, 5);
    const cons = sanitizeList(tool.pros_cons?.cons, 5);
    const pricingLabel = formatPricingLabel(tool.pricing_type);
    const summary = tool.short_description || tool.description || `${tool.name} overview and feature breakdown.`;
    const canonical = localCanonicalUrl(tool.canonical_url, `/tools/${tool.slug}`);
    const socialImage = tool.image_url || tool.icon_url || undefined;
    const visitUrl = tool.affiliate_url || tool.url || undefined;
    const visitRel = tool.affiliate_url ? "sponsored noopener noreferrer" : "noopener noreferrer";
    const faq = [
        {
            q: `What is ${tool.name} used for?`,
            a: useCaseList.length > 0
                ? `${tool.name} is commonly used for ${useCaseList.slice(0, 3).join(", ")}.`
                : `${tool.name} is used for ${primaryCategory ? `${primaryCategory.name.toLowerCase()} workflows` : "AI-powered workflows"}.`,
        },
        {
            q: `Is ${tool.name} free?`,
            a: tool.pricing_type === "Free"
                ? `${tool.name} is listed as free to use.`
                : tool.pricing_type === "Freemium"
                    ? `${tool.name} offers a freemium pricing model.`
                    : tool.pricing_type === "Free-Trial"
                        ? `${tool.name} offers a free trial before paid access.`
                        : tool.pricing_type === "Contact"
                            ? `${tool.name} uses custom pricing.`
                            : `${tool.name} uses paid pricing.`,
        },
        {
            q: `How do I compare ${tool.name} with alternatives?`,
            a: "Review pricing, feature coverage, ratings, and similar tools on this page before visiting the product site.",
        },
    ];

    async function upvoteTool() {
        "use server";

        await incrementToolUpvotes(toolId);
        revalidatePath(`/tools/${toolSlug}`);
        revalidatePath("/top-rated");
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: summary,
        url: tool.url || canonical,
        mainEntityOfPage: canonical,
        image: socialImage,
        applicationCategory: tool.categories?.[0]?.name || "AI Tool",
        operatingSystem: "Web",
        offers: tool.pricing_type === "Free"
            ? {
                "@type": "Offer",
                price: "0",
                priceCurrency: tool.currency_code || "USD",
            }
            : undefined,
        aggregateRating: tool.rating_score > 0 && tool.rating_count > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: tool.rating_score.toString(),
                ratingCount: tool.rating_count.toString(),
                bestRating: "5",
            }
            : undefined,
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

    const lastUpdatedStr = tool.updated_at
        ? new Date(tool.updated_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "Recent";

    function getInitials(toolName: string): string {
        const parts = toolName
            .split(/\s+/)
            .map((part) => part.trim())
            .filter(Boolean);

        if (parts.length === 0) return "?";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

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

            <StickyToolBar
                name={tool.name}
                iconUrl={tool.icon_url}
                visitUrl={visitUrl}
                visitRel={visitRel}
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

                <section className="tool-hero" id="tool-hero-section" aria-label="Tool overview">
                    <div className="tool-hero-main">
                        <div className="tool-hero-top">
                            <div className="tool-hero-identity-icon" aria-hidden="true">
                                {tool.icon_url ? (
                                    <img
                                        src={tool.icon_url}
                                        alt={`${tool.name} logo`}
                                        className="w-full h-full object-cover rounded-xs"
                                    />
                                ) : (
                                    <span style={{ color: "var(--brand)", fontWeight: "bold" }}>
                                        {getInitials(tool.name)}
                                    </span>
                                )}
                            </div>
                            <div className="tool-hero-heading">
                                <h1>{tool.name}</h1>
                                <div className="tool-meta-row">
                                    {tool.rating_score > 0 && (
                                        <span className="tool-meta-item" style={{ color: "var(--highlight-accent)" }}>
                                            <RatingStars score={tool.rating_score} count={tool.rating_count} />
                                        </span>
                                    )}
                                    <span className="tool-meta-item text-muted">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "2px" }}>
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
                                        <span className="tool-meta-item" style={{ color: "var(--highlight-accent)", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                    {visitUrl && (
                                        <a href={visitUrl} target="_blank" rel={visitRel} className="tool-meta-item text-muted" style={{ textDecoration: "none" }}>
                                            🔗 {tool.url ? new URL(tool.url).hostname : "website"}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="tool-hero-desc">
                            {longDescription
                                .split(/\n+/)
                                .filter((paragraph) => paragraph.trim().length > 0)
                                .map((paragraph, index) => (
                                    <p key={`${tool.id}-desc-${index}`} style={{ margin: "0 0 12px" }}>
                                        {paragraph.trim()}
                                    </p>
                                ))}
                        </div>

                        <div className="tool-cta-row">
                            {visitUrl && (
                                <a href={visitUrl} target="_blank" rel={visitRel} className="btn-primary" style={{ padding: "11px 20px", fontSize: "14px", fontWeight: 600 }}>
                                    Visit Tool →
                                </a>
                            )}
                            <form action={upvoteTool} style={{ display: "inline-block" }}>
                                <button type="submit" className="btn-secondary" style={{ padding: "11px 20px", fontSize: "14px", fontWeight: 600 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: "4px" }}>
                                        <path d="M12 19V5M5 12l7-7 7 7" />
                                    </svg>
                                    Upvote ({tool.upvotes || 0})
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="tool-hero-preview">
                        <ToolPreviewImage name={tool.name} imageUrl={tool.image_url} />
                    </div>
                </section>

                <div className="tool-stat-strip" aria-label="Quick facts">
                    <div className="tool-stat">
                        <div className="tool-stat-label">Category</div>
                        <div className="tool-stat-value">{primaryCategory?.name || "AI Tool"}</div>
                    </div>
                    <div className="tool-stat">
                        <div className="tool-stat-label">Website</div>
                        <div className="tool-stat-value">
                            {tool.url ? (
                                <a href={visitUrl} target="_blank" rel={visitRel}>
                                    {new URL(tool.url).hostname}
                                </a>
                            ) : (
                                "Not listed"
                            )}
                        </div>
                    </div>
                    <div className="tool-stat">
                        <div className="tool-stat-label">Verification</div>
                        <div className="tool-stat-value">
                            {tool.is_verified ? "Verified listing" : "Community listing"}
                        </div>
                    </div>
                    <div className="tool-stat">
                        <div className="tool-stat-label">Last updated</div>
                        <div className="tool-stat-value">{lastUpdatedStr}</div>
                    </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                    <DirectAnswerCard
                        title={`What is ${tool.name}?`}
                        summary={`${tool.name} is a ${pricingLabel.toLowerCase()} AI tool ${
                            primaryCategory ? `categorized under ${primaryCategory.name}` : "for AI workflows"
                        }${tool.publisher ? ` published by ${tool.publisher}` : ""}. It is designed for ${
                            useCaseList.length > 0 ? useCaseList.slice(0, 3).join(", ") : "AI productivity"
                        }, with a rating score of ${(tool.rating_score || 0).toFixed(1)}/5.`}
                        badgeLabel="Quick Answer"
                        highlights={[
                            { label: "Pricing Model", value: pricingLabel },
                            { label: "Category", value: primaryCategory?.name || "AI Tool" },
                            { label: "Rating", value: `${(tool.rating_score || 0).toFixed(1)} / 5.0` },
                        ]}
                    />
                </div>

                <nav className="tool-quicknav" aria-label="Jump to section">
                    <a href="#features">Features</a>
                    <a href="#proscons">Pros &amp; cons</a>
                    <a href="#faq">FAQ</a>
                </nav>

                {(featureList.length > 0 || useCaseList.length > 0 || pros.length > 0 || cons.length > 0) && (
                    <section className="section" id="features">
                        <h2 className="section-title">What to know</h2>
                        <div className="tool-info-grid">
                            {featureList.length > 0 && (
                                <div className="tool-info-card" id="card-features">
                                    <h3>Key features</h3>
                                    <ul>
                                        {featureList.map((item) => (
                                            <li key={item}>
                                                <span className="tool-icon-dot tool-dot-feature" aria-hidden="true" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {useCaseList.length > 0 && (
                                <div className="tool-info-card" id="card-bestfor">
                                    <h3>Best for</h3>
                                    <ul>
                                        {useCaseList.map((item) => (
                                            <li key={item}>
                                                <span className="tool-icon-dot tool-dot-feature" aria-hidden="true" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {pros.length > 0 && (
                                <div className="tool-info-card" id="card-pros">
                                    <h3>Pros</h3>
                                    <ul>
                                        {pros.map((item) => (
                                            <li key={item}>
                                                <span className="tool-icon-dot tool-dot-pro" aria-hidden="true" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {cons.length > 0 && (
                                <div className="tool-info-card" id="card-cons">
                                    <h3>Cons</h3>
                                    <ul>
                                        {cons.map((item) => (
                                            <li key={item}>
                                                <span className="tool-icon-dot tool-dot-con" aria-hidden="true" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <div className="meta-footer" id="proscons">
                    <div className="published-by">
                        {tool.publisher ? (
                            <>
                                Published by <strong>{tool.publisher}</strong>
                            </>
                        ) : (
                            "Community listing"
                        )}
                    </div>
                    {tool.categories.length > 0 && (
                        <div className="tags">
                            {tool.categories.map((cat) => (
                                <Link key={cat.id} href={`/category/${cat.slug}`} className="tag">
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <section className="section" id="faq">
                    <h2 className="section-title">{tool.name} FAQ</h2>
                    <div style={{ display: "grid", gap: "10px" }}>
                        {faq.map((item, index) => (
                            <details key={item.q} className="tool-faq-item" open={index === 0}>
                                <summary className="tool-faq-q">
                                    <span>{item.q}</span>
                                    <span className="chev" aria-hidden="true">⌄</span>
                                </summary>
                                <div className="tool-faq-a">{item.a}</div>
                            </details>
                        ))}
                    </div>
                </section>

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
                        <div className="card" style={{ padding: "16px", marginTop: "20px" }}>
                            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--text-primary)" }}>
                                Explore Alternatives
                            </h3>
                            <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                                Compare close alternatives to {tool.name} and discover the best fit for your workflow.
                            </p>
                            <div style={{ display: "grid", gap: "8px" }}>
                                {similarTools.map((alt) => (
                                    <Link key={`alt-link-${alt.id}`} href={`/tools/${alt.slug}`} className="tool-detail-cat-link">
                                        Alternative to {tool.name}: {alt.name}
                                    </Link>
                                ))}
                            </div>
                            {primaryCategory ? (
                                <p style={{ margin: "12px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                                    See all options in{" "}
                                    <Link href={`/category/${primaryCategory.slug}`} className="tool-detail-cat-link">
                                        Best {primaryCategory.name} AI Tools
                                    </Link>
                                    {" "}or browse the full{" "}
                                    <Link href="/ai-tools" className="tool-detail-cat-link">
                                        AI Tools Directory
                                    </Link>
                                    .
                                </p>
                            ) : null}
                        </div>
                    </section>
                )}
            </div>

            <BackToTop />
        </>
    );
}
