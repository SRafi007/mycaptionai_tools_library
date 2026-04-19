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

    const style = {
        "--eco-accent": brand.accent,
        "--eco-tint": brand.tint,
    } as CSSProperties;

    return (
        <Link href={`/ecosystems/${ecosystem.slug}`} className="ecosystem-card" style={style}>
            <div className="ecosystem-card-glow" aria-hidden="true" />

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
                    {toolCount !== null && (
                        <span className="ecosystem-card-meta">{toolCount} tool{toolCount === 1 ? "" : "s"}</span>
                    )}
                </div>
            </div>

            <p className="ecosystem-card-desc">
                {ecosystem.description || `Discover tools and playbooks built around the ${ecosystem.name} ecosystem.`}
            </p>

            {previewTools.length > 0 && (
                <div className="ecosystem-card-avatars" aria-label="Featured tools in this ecosystem">
                    {previewTools.map((tool) => (
                        <span key={tool.id} className="ecosystem-card-avatar" title={tool.name}>
                            {tool.icon_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={tool.icon_url} alt={tool.name} loading="lazy" />
                            ) : (
                                <span className="ecosystem-card-avatar-letter">{tool.name.charAt(0)}</span>
                            )}
                        </span>
                    ))}
                    {toolCount !== null && toolCount > previewTools.length && (
                        <span className="ecosystem-card-avatar-more">+{toolCount - previewTools.length}</span>
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
