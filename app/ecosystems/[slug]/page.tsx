import { Metadata } from "next";
import { getEcosystemBySlug, getEcosystems } from "@/lib/db/ecosystems";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import Link from "next/link";

export const revalidate = 60;

export async function generateStaticParams() {
    const ecosystems = await getEcosystems();
    return ecosystems.map((eco) => ({
        slug: eco.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const ecosystem = await getEcosystemBySlug(resolvedParams.slug);
    if (!ecosystem) return { title: "Not Found" };

    return {
        title: `${ecosystem.name} Ecosystem & Top Tools`,
        description: ecosystem.description || `Explore the ${ecosystem.name} ecosystem.`,
        alternates: {
            canonical: absoluteUrl(`/ecosystems/${ecosystem.slug}`),
        },
    };
}

export default async function EcosystemDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const ecosystem = await getEcosystemBySlug(resolvedParams.slug);

    if (!ecosystem) {
        notFound();
    }

    // Group tools by role_category
    const categorizedTools = ecosystem.tools.reduce((acc, tool) => {
        const cat = tool.role_category || "Other Tools";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tool);
        return acc;
    }, {} as Record<string, typeof ecosystem.tools>);

    return (
        <div className="container-main section-padding">
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "48px", marginTop: "32px" }}>
                 <div className="tool-card-icon" style={{ width: 80, height: 80 }}>
                    {ecosystem.icon_url ? (
                        <img src={ecosystem.icon_url} alt={ecosystem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <span style={{ fontSize: "40px" }}>🌐</span>
                    )}
                 </div>
                 <div>
                    <h1 className="hero-title" style={{ textAlign: "left", margin: 0 }}>
                        {ecosystem.name} Ecosystem
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginTop: "12px", maxWidth: "800px" }}>
                        {ecosystem.description}
                    </p>
                 </div>
            </div>

            {Object.entries(categorizedTools).map(([category, tools]) => (
                <div key={category} style={{ marginBottom: "64px" }}>
                    <div className="section-header">
                        <h2 className="section-title">{category}</h2>
                    </div>
                    <div className="tools-grid">
                        {tools.map((tool) => (
                            <article key={tool.id} className="card tool-card ecosystem-tool-card">
                                <div className="tool-card-header">
                                    <div className="tool-card-identity">
                                        <div
                                            className={`tool-card-icon ${tool.icon_url || tool.image_url ? "tool-card-icon-image" : "tool-card-icon-fallback"}`}
                                            style={
                                                tool.icon_url || tool.image_url
                                                    ? { background: `url(${tool.icon_url || tool.image_url}) center/cover` }
                                                    : undefined
                                            }
                                        >
                                            {!tool.icon_url && !tool.image_url && (
                                                <span>{tool.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="tool-card-title-wrap">
                                            <h3 className="tool-card-name">
                                                <Link href={`/tools/${tool.slug}`} className="tool-card-name-link">
                                                    {tool.name}
                                                </Link>
                                            </h3>
                                            <span className="ecosystem-tool-role">{tool.role_category || "Ecosystem tool"}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="tool-card-desc">
                                    {tool.ecosystem_summary || tool.short_description || tool.description}
                                </p>

                                {(tool.best_for || tool.when_to_use || tool.recommendation || (tool.use_case_examples && tool.use_case_examples.length > 0)) && (
                                    <div className="ecosystem-tool-guidance">
                                        {tool.best_for && (
                                            <div className="ecosystem-tool-guidance-row">
                                                <span>Best for</span>
                                                <strong>{tool.best_for}</strong>
                                            </div>
                                        )}
                                        {tool.when_to_use && (
                                            <div className="ecosystem-tool-guidance-row">
                                                <span>When to use</span>
                                                <p>{tool.when_to_use}</p>
                                            </div>
                                        )}
                                        {tool.use_case_examples && tool.use_case_examples.length > 0 && (
                                            <div className="ecosystem-tool-usecases">
                                                {tool.use_case_examples.slice(0, 3).map((useCase) => (
                                                    <span key={useCase}>{useCase}</span>
                                                ))}
                                            </div>
                                        )}
                                        {tool.recommendation && (
                                            <p className="ecosystem-tool-recommendation">{tool.recommendation}</p>
                                        )}
                                    </div>
                                )}

                                <div className="tool-card-footer">
                                    <div className="tool-card-meta">
                                        {tool.content_status && tool.content_status !== "active" && (
                                            <span className="ecosystem-tool-status">{tool.content_status}</span>
                                        )}
                                    </div>
                                    {tool.url && (
                                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                                            Visit
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            ))}

            {ecosystem.tools.length === 0 && (
                <div className="empty-state">
                    <p>No tools listed in this ecosystem yet.</p>
                </div>
            )}
        </div>
    );
}
