import { Metadata } from "next";
import { getEcosystemBySlug, getEcosystems } from "@/lib/db/ecosystems";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import EcosystemDetailCard from "@/components/ecosystem-detail-card";
import EcoCategoryNav from "@/components/ecosystem-category-nav";

export const revalidate = 60;

/* ── Brand theming per ecosystem ── */
const BRAND_THEME: Record<string, { accent: string; gradientFrom: string; gradientTo: string }> = {
    openai: { accent: "#10a37f", gradientFrom: "rgba(16,163,127,0.12)", gradientTo: "rgba(16,163,127,0.03)" },
    anthropic: { accent: "#d97757", gradientFrom: "rgba(217,119,87,0.14)", gradientTo: "rgba(217,119,87,0.03)" },
    "google-gemini": { accent: "#4285f4", gradientFrom: "rgba(66,133,244,0.12)", gradientTo: "rgba(66,133,244,0.03)" },
    google: { accent: "#4285f4", gradientFrom: "rgba(66,133,244,0.12)", gradientTo: "rgba(66,133,244,0.03)" },
    gemini: { accent: "#4285f4", gradientFrom: "rgba(66,133,244,0.12)", gradientTo: "rgba(66,133,244,0.03)" },
    "open-source": { accent: "#607994", gradientFrom: "rgba(96,121,148,0.10)", gradientTo: "rgba(96,121,148,0.03)" },
    meta: { accent: "#0866ff", gradientFrom: "rgba(8,102,255,0.10)", gradientTo: "rgba(8,102,255,0.03)" },
    mistral: { accent: "#ff7000", gradientFrom: "rgba(255,112,0,0.12)", gradientTo: "rgba(255,112,0,0.03)" },
    cohere: { accent: "#39594d", gradientFrom: "rgba(57,89,77,0.10)", gradientTo: "rgba(57,89,77,0.03)" },
    perplexity: { accent: "#20808d", gradientFrom: "rgba(32,128,141,0.12)", gradientTo: "rgba(32,128,141,0.03)" },
};

const FALLBACK_THEME = { accent: "#3585e8", gradientFrom: "rgba(53,133,232,0.10)", gradientTo: "rgba(53,133,232,0.03)" };

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

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

    const brand = BRAND_THEME[ecosystem.slug] || FALLBACK_THEME;

    // Group tools by role_category
    const categorizedTools = ecosystem.tools.reduce((acc, tool) => {
        const cat = tool.role_category || "Other Tools";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(tool);
        return acc;
    }, {} as Record<string, typeof ecosystem.tools>);

    const categories = Object.keys(categorizedTools);
    const totalTools = ecosystem.tools.length;

    const heroStyle = {
        "--eco-accent": brand.accent,
        "--eco-grad-from": brand.gradientFrom,
        "--eco-grad-to": brand.gradientTo,
    } as React.CSSProperties;

    return (
        <div className="eco-detail-page" style={heroStyle}>
            {/* ── HERO ── */}
            <section className="eco-hero">
                <div className="eco-hero-glow" aria-hidden="true" />
                <div className="eco-hero-inner container-main">
                    <div className="eco-hero-logo">
                        {ecosystem.icon_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={ecosystem.icon_url} alt={ecosystem.name} />
                        ) : (
                            <span>{ecosystem.name.charAt(0)}</span>
                        )}
                    </div>

                    <div className="eco-hero-content">
                        <h1 className="eco-hero-title">{ecosystem.name}</h1>

                        <div className="eco-hero-stats">
                            <div className="eco-hero-stat">
                                <span className="eco-hero-stat-value">{totalTools}</span>
                                <span className="eco-hero-stat-label">Tools</span>
                            </div>
                            <div className="eco-hero-stat-sep" aria-hidden="true" />
                            <div className="eco-hero-stat">
                                <span className="eco-hero-stat-value">{categories.length}</span>
                                <span className="eco-hero-stat-label">Categories</span>
                            </div>
                            <div className="eco-hero-stat-sep" aria-hidden="true" />
                            <div className="eco-hero-stat">
                                <span className="eco-hero-stat-value">
                                    {ecosystem.tools.filter(t => t.url).length}
                                </span>
                                <span className="eco-hero-stat-label">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STICKY NAV ── */}
            {categories.length > 1 && (
                <EcoCategoryNav categories={categories} brandAccent={brand.accent} />
            )}

            {/* ── CATEGORY LANES ── */}
            <div className="eco-lanes container-main">
                {Object.entries(categorizedTools).map(([category, tools], idx) => (
                    <section
                        key={category}
                        id={`eco-cat-${slugify(category)}`}
                        className="eco-lane"
                        style={{ "--lane-index": idx } as React.CSSProperties}
                    >
                        {/* Lane header */}
                        <div className="eco-lane-header">
                            <div className="eco-lane-marker" aria-hidden="true">
                                <div className="eco-lane-dot" />
                            </div>
                            <h2 className="eco-lane-title">{category}</h2>
                            <span className="eco-lane-count">{tools.length} {tools.length === 1 ? "tool" : "tools"}</span>
                        </div>

                        {/* Connection line */}
                        <div className="eco-lane-connector" aria-hidden="true" />

                        {/* Tools grid */}
                        <div className="eco-lane-grid">
                            {tools.map((tool) => (
                                <EcosystemDetailCard key={tool.id} tool={tool} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {ecosystem.tools.length === 0 && (
                <div className="container-main" style={{ padding: "80px 24px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>No tools listed in this ecosystem yet.</p>
                </div>
            )}
        </div>
    );
}
