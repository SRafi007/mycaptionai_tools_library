import { Metadata } from "next";
import { getEcosystemBySlug, getEcosystems } from "@/lib/db/ecosystems";
import ToolCard from "@/components/tool-card";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";

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
                            <ToolCard key={tool.id} tool={tool} showVisitButton={true} />
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
