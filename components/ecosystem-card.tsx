import Link from "next/link";
import type { CSSProperties } from "react";
import type { Ecosystem, EcosystemWithPreview } from "@/types/ecosystem";

const ECOSYSTEM_BRAND: Record<string, { accent: string; tint: string }> = {
    openai: { accent: "#10a37f", tint: "rgba(16, 163, 127, 0.10)" },
    anthropic: { accent: "#d97757", tint: "rgba(217, 119, 87, 0.10)" },
    "google-gemini": { accent: "#4285f4", tint: "rgba(66, 133, 244, 0.10)" },
    google: { accent: "#4285f4", tint: "rgba(66, 133, 244, 0.10)" },
    gemini: { accent: "#4285f4", tint: "rgba(66, 133, 244, 0.10)" },
    "open-source": { accent: "#a855f7", tint: "rgba(168, 85, 247, 0.10)" },
    meta: { accent: "#0866ff", tint: "rgba(8, 102, 255, 0.10)" },
    mistral: { accent: "#ff7000", tint: "rgba(255, 112, 0, 0.10)" },
    cohere: { accent: "#39594d", tint: "rgba(57, 89, 77, 0.10)" },
    perplexity: { accent: "#20808d", tint: "rgba(32, 128, 141, 0.10)" },
};

const FALLBACK_BRAND = { accent: "#5ad8ff", tint: "rgba(90, 216, 255, 0.10)" };

const ECOSYSTEM_FOCUS: Record<string, string> = {
    openai: "Apps, agents, APIs",
    anthropic: "Claude workflows",
    "google-gemini": "Google AI stack",
    "open-source": "Local + open models",
};

function brandFor(slug: string) {
    return ECOSYSTEM_BRAND[slug] || FALLBACK_BRAND;
}

type EcosystemCardData = Ecosystem | EcosystemWithPreview;

function hasPreview(eco: EcosystemCardData): eco is EcosystemWithPreview {
    return "preview_tools" in eco;
}

export default function EcosystemCard({ ecosystem }: { ecosystem: EcosystemCardData }) {
    const brand = brandFor(ecosystem.slug);
    const previewTools = hasPreview(ecosystem) ? ecosystem.preview_tools : [];
    const toolCount = hasPreview(ecosystem) ? ecosystem.tool_count : null;
    const focus = ECOSYSTEM_FOCUS[ecosystem.slug] || "Provider stack";
    const visibleTools = previewTools.slice(0, 3);
    const remainingTools = toolCount !== null ? Math.max(toolCount - visibleTools.length, 0) : 0;

    const style = {
        "--eco-accent": brand.accent,
        "--eco-tint": brand.tint,
    } as CSSProperties;

    return (
        <Link href={`/ecosystems/${ecosystem.slug}`} className="ecosystem-card" style={style}>
            <div className="ecosystem-card-glow" aria-hidden="true" />

            <div className="ecosystem-card-topline">
                <span className="ecosystem-card-kicker">{focus}</span>
                {toolCount !== null && (
                    <span className="ecosystem-card-count">
                        {toolCount} tool{toolCount === 1 ? "" : "s"}
                    </span>
                )}
            </div>

            <div className="ecosystem-card-head">
                <div className="ecosystem-card-icon">
                    {ecosystem.icon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ecosystem.icon_url} alt="" />
                    ) : (
                        <span aria-hidden="true">{ecosystem.name.charAt(0)}</span>
                    )}
                </div>
                <div className="ecosystem-card-titles">
                    <h3 className="ecosystem-card-name">{ecosystem.name}</h3>
                    <span className="ecosystem-card-meta">Curated ecosystem map</span>
                </div>
            </div>

            <p className="ecosystem-card-desc">
                {ecosystem.description || `Discover tools and playbooks built around the ${ecosystem.name} ecosystem.`}
            </p>

            {visibleTools.length > 0 && (
                <div className="ecosystem-card-preview" aria-label="Featured tools in this ecosystem">
                    <span className="ecosystem-card-preview-label">Start with</span>
                    <div className="ecosystem-card-tool-list">
                        {visibleTools.map((tool) => (
                            <span key={tool.id} className="ecosystem-card-tool" title={tool.name}>
                                <span className="ecosystem-card-tool-icon">
                                    {tool.icon_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={tool.icon_url} alt="" loading="lazy" />
                                    ) : (
                                        <span aria-hidden="true">{tool.name.charAt(0)}</span>
                                    )}
                                </span>
                                <span className="ecosystem-card-tool-name">{tool.name}</span>
                            </span>
                        ))}
                    </div>
                    {remainingTools > 0 && (
                        <span className="ecosystem-card-more">+{remainingTools} more mapped tools</span>
                    )}
                </div>
            )}

            <div className="ecosystem-card-cta">
                <span>Explore ecosystem</span>
                <span aria-hidden="true" className="ecosystem-card-arrow">&rarr;</span>
            </div>
        </Link>
    );
}
