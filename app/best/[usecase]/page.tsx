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
export const revalidate = 60;

export async function generateStaticParams() {
    return USE_CASES.map((entry) => ({ usecase: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { usecase } = await params;
    const config = USE_CASE_MAP.get(usecase);
    if (!config) return { title: "Best AI Tools" };

    const year = new Date().getFullYear();
    const title = `${config.title} (${year}) | ${SITE_NAME}`;
    const canonical = absoluteUrl(`/best/${config.slug}`);
    return {
        title,
        description: config.description,
        alternates: { canonical },
        openGraph: {
            title,
            description: config.description,
            url: canonical,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: config.description,
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
                        { label: "Best AI Tools", href: "/browse" },
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
