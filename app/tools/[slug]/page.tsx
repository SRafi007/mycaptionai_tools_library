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
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH, localCanonicalUrl } from "@/lib/seo";

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
    const visitUrl = tool.affiliate_url || tool.url;
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
                        ...(tool.categories.length > 0
                            ? [{ label: tool.categories[0].name, href: `/category/${tool.categories[0].slug}` }]
                            : []),
                        { label: tool.name },
                    ]}
                    currentPath={`/tools/${tool.slug}`}
                />

                <div className="tool-detail-layout">
                    <div className="tool-detail-content">
                        <div className="tool-detail-header">
                            <div className="tool-detail-identity">
                                <ToolDetailVisual
                                    variant="icon"
                                    name={tool.name}
                                    imageUrl={tool.image_url}
                                    iconUrl={tool.icon_url}
                                />
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
                                {visitUrl && (
                                    <a href={visitUrl} target="_blank" rel={visitRel} className="btn-primary btn-sm tool-detail-action-btn">
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

                        <section className="card" style={{ padding: "18px", marginTop: "20px" }}>
                            <h2 className="section-title" style={{ fontSize: "18px", marginBottom: "10px" }}>Tool Snapshot</h2>
                            <p style={{ margin: "0 0 14px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                                {summary}
                            </p>
                            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                                <div className="card" style={{ padding: "14px" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pricing</p>
                                    <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontWeight: 600 }}>{pricingLabel}</p>
                                </div>
                                <div className="card" style={{ padding: "14px" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Primary category</p>
                                    <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontWeight: 600 }}>{primaryCategory?.name || "AI Tool"}</p>
                                </div>
                                <div className="card" style={{ padding: "14px" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Publisher</p>
                                    <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontWeight: 600 }}>{tool.publisher || "Not listed"}</p>
                                </div>
                                <div className="card" style={{ padding: "14px" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Verification</p>
                                    <p style={{ margin: 0, fontSize: "15px", color: "var(--text-primary)", fontWeight: 600 }}>{tool.is_verified ? "Verified listing" : "Community listing"}</p>
                                </div>
                            </div>
                        </section>

                        {(featureList.length > 0 || useCaseList.length > 0 || pros.length > 0 || cons.length > 0) && (
                            <section className="section-padding section-border-t" style={{ marginTop: "28px", paddingTop: "24px" }}>
                                <div className="section-header">
                                    <h2 className="section-title">What To Know About {tool.name}</h2>
                                </div>
                                <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                                    {featureList.length > 0 && (
                                        <article className="card" style={{ padding: "16px" }}>
                                            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--text-primary)" }}>Key features</h3>
                                            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "8px" }}>
                                                {featureList.map((feature) => (
                                                    <li key={feature} style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{feature}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    )}
                                    {useCaseList.length > 0 && (
                                        <article className="card" style={{ padding: "16px" }}>
                                            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--text-primary)" }}>Best for</h3>
                                            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "8px" }}>
                                                {useCaseList.map((useCase) => (
                                                    <li key={useCase} style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{useCase}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    )}
                                    {pros.length > 0 && (
                                        <article className="card" style={{ padding: "16px" }}>
                                            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--text-primary)" }}>Pros</h3>
                                            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "8px" }}>
                                                {pros.map((pro) => (
                                                    <li key={pro} style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{pro}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    )}
                                    {cons.length > 0 && (
                                        <article className="card" style={{ padding: "16px" }}>
                                            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "var(--text-primary)" }}>Cons</h3>
                                            <ul style={{ margin: 0, paddingLeft: "18px", display: "grid", gap: "8px" }}>
                                                {cons.map((con) => (
                                                    <li key={con} style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{con}</li>
                                                ))}
                                            </ul>
                                        </article>
                                    )}
                                </div>
                            </section>
                        )}

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

                    <ToolDetailVisual
                        variant="banner"
                        name={tool.name}
                        imageUrl={tool.image_url}
                        iconUrl={tool.icon_url}
                        pricingLabel={pricingLabel}
                        category={primaryCategory?.name || "AI Tool"}
                        isVerified={tool.is_verified}
                    />
                </div>

                <section className="section-padding section-border-t" style={{ marginTop: "28px" }}>
                    <div className="section-header">
                        <h2 className="section-title">{tool.name} FAQ</h2>
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
