import { Metadata } from "next";
import { getTopRatedTools } from "@/lib/db/tools";
import ToolCard from "@/components/tool-card";
import BackToTop from "@/components/back-to-top";

export const metadata: Metadata = {
    title: "Top Rated AI Tools — Best AI Tools Ranked | MyCaptionAI",
    description:
        "Discover the highest-rated AI tools across all categories. Ranked by user ratings and reviews. Updated daily.",
};

export default async function TopRatedPage() {
    const tools = await getTopRatedTools(50);

    return (
        <div className="container-main">
            <div className="page-header">
                <h1 className="page-title">Top Rated AI Tools</h1>
                <p className="page-subtitle">
                    The highest-rated AI tools across all categories, ranked by user reviews and ratings.
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
                                            background: i === 0 ? "#EAB308" : i === 1 ? "#94A3B8" : "#CD7F32",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            color: "#000",
                                        }}
                                    >
                                        #{i + 1}
                                    </div>
                                )}
                                <ToolCard tool={tool} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">⭐</div>
                        <p className="empty-state-text">No rated tools yet.</p>
                    </div>
                )}
            </div>

            <BackToTop />
        </div>
    );
}
