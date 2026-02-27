import { Metadata } from "next";
import { getTopUpvotedTools } from "@/lib/db/tools";
import ToolCard from "@/components/tool-card";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Top Rated AI Tools - Best AI Tools Ranked",
    description:
        "Discover top AI tools across all categories. Ranked by community upvotes.",
    alternates: {
        canonical: absoluteUrl("/top-rated"),
    },
    openGraph: {
        title: "Top Rated AI Tools - Best AI Tools Ranked",
        description: "Discover top AI tools across all categories. Ranked by community upvotes.",
        url: absoluteUrl("/top-rated"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Top Rated AI Tools - Best AI Tools Ranked",
        description: "Discover top AI tools across all categories. Ranked by community upvotes.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default async function TopRatedPage() {
    const tools = await getTopUpvotedTools(50);

    return (
        <div className="container-main">
            <div className="page-header">
                <h1 className="page-title">Top Rated AI Tools</h1>
                <p className="page-subtitle">
                    Top tools across all categories, ranked by community upvotes.
                </p>
            </div>

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
