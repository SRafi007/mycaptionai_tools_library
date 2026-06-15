import { Metadata } from "next";
import { getTopUpvotedTools } from "@/lib/db/tools";
import ToolCard from "@/components/tool-card";
import BackToTop from "@/components/back-to-top";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
    title: `Top AI Tools Ranked by Upvotes | ${SITE_NAME}`,
    description:
        "Compare the top AI tools across writing, image generation, video, marketing, and coding. Ranked by community upvotes.",
    alternates: {
        canonical: absoluteUrl("/top-rated"),
    },
    openGraph: {
        title: `Top AI Tools Ranked by Upvotes | ${SITE_NAME}`,
        description: "Compare the top AI tools across major categories, ranked by community upvotes.",
        url: absoluteUrl("/top-rated"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: `Top AI Tools Ranked by Upvotes | ${SITE_NAME}`,
        description: "Compare the top AI tools across major categories, ranked by community upvotes.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default async function TopRatedPage() {
    const tools = await getTopUpvotedTools(50);
    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Top AI Tools Ranked by Upvotes",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: absoluteUrl(`/tools/${tool.slug}`),
        })),
    };

    return (
        <div className="container-main">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
            <PageHeader
                title="Top Rated AI Tools"
                subtitle="Compare the highest-upvoted AI tools across major categories and open each profile for pricing, features, and alternatives."
            />

            <div className="section-padding">
                {tools.length > 0 ? (
                    <div className="tools-grid">
                        {tools.map((tool, i) => (
                            <div key={tool.id} style={{ position: "relative" }}>
                                {i < 3 && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "-6px",
                                            left: "-6px",
                                            zIndex: 2,
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            background: i === 0 ? "var(--rank-gold)" : i === 1 ? "var(--rank-silver)" : "var(--rank-bronze)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "var(--rank-text)",
                                        }}
                                    >
                                        #{i + 1}
                                    </div>
                                )}
                                <ToolCard tool={tool} showUpvoteButton revalidatePaths={["/top-rated"]} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">Top</div>
                        <p className="empty-state-text">No tools yet.</p>
                    </div>
                )}
            </div>

            <BackToTop />
        </div>
    );
}
