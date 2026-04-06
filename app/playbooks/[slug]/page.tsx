import { Metadata } from "next";
import { getPlaybookBySlug, getPublishedPlaybooks } from "@/lib/db/playbooks";
import ToolCard from "@/components/tool-card";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
    const playbooks = await getPublishedPlaybooks();
    return playbooks.map((pb) => ({
        slug: pb.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const playbook = await getPlaybookBySlug(resolvedParams.slug);
    if (!playbook) return { title: "Not Found" };

    return {
        title: `${playbook.title} | AI Playbooks`,
        description: playbook.description || `View the ${playbook.title} playbook.`,
        alternates: {
            canonical: absoluteUrl(`/playbooks/${playbook.slug}`),
        },
    };
}

export default async function PlaybookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const playbook = await getPlaybookBySlug(resolvedParams.slug);

    if (!playbook) {
        notFound();
    }

    return (
        <div className="container-main section-padding">
            <div style={{ maxWidth: "800px", margin: "0 auto", marginBottom: "64px", paddingTop: "32px" }}>
                <div className="badge badge-verified" style={{ marginBottom: "16px", display: "inline-flex" }}>
                    PLAYBOOK
                </div>
                <h1 className="hero-title" style={{ textAlign: "left", margin: "0 0 24px 0" }}>
                    {playbook.title}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "18px", lineHeight: 1.6 }}>
                    {playbook.description}
                </p>
                
                {playbook.ecosystem && (
                   <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", width: "fit-content" }}>
                      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Built around:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{playbook.ecosystem.name}</strong>
                   </div>
                )}
            </div>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <h2 className="section-title" style={{ marginBottom: "32px" }}>Stack Workflow</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {playbook.tools.map((tool, index) => (
                        <div key={`${tool.id}-${index}`} style={{ display: "flex", gap: "24px", background: "var(--bg-surface)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border-default)" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "20px", background: "var(--bg-primary)", color: "var(--accent)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", flexShrink: 0 }}>
                                {tool.step_order || index + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                                    {tool.name}
                                </h3>
                                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                                    {tool.step_description || "Use this tool as part of the stack."}
                                </div>
                                
                                <div>
                                   <ToolCard tool={tool} showVisitButton={true} />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {playbook.tools.length === 0 && (
                        <div className="empty-state">
                            <p>No tools listed in this playbook yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
