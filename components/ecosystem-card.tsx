import Link from "next/link";
import type { CSSProperties } from "react";
import type { Ecosystem, EcosystemWithPreview } from "@/types/ecosystem";

const ECOSYSTEM_BRAND: Record<string, { accent: string }> = {
    openai: { accent: "#10a37f" },
    anthropic: { accent: "#d97757" },
    "google-gemini": { accent: "#4285f4" },
    google: { accent: "#4285f4" },
    gemini: { accent: "#4285f4" },
    "open-source": { accent: "#607994" },
    meta: { accent: "#0866ff" },
    mistral: { accent: "#ff7000" },
    cohere: { accent: "#39594d" },
    perplexity: { accent: "#20808d" },
};

const FALLBACK_BRAND = { accent: "#3585e8" };

const ECOSYSTEM_SUMMARY: Record<string, string> = {
    openai: "ChatGPT, Codex, APIs, agents, and media tools in one connected stack.",
    anthropic: "Claude apps, coding agents, API tools, and team workflow integrations.",
    "google-gemini": "Gemini apps, Google AI Studio, NotebookLM, APIs, and coding tools.",
    "open-source": "Open models, local runtimes, self-hosted UIs, and inference servers.",
};

function brandFor(slug: string) {
    return ECOSYSTEM_BRAND[slug] || FALLBACK_BRAND;
}

type EcosystemCardData = Ecosystem | EcosystemWithPreview;

function hasPreview(eco: EcosystemCardData): eco is EcosystemWithPreview {
    return "preview_tools" in eco;
}

function getShortDescription(ecosystem: EcosystemCardData) {
    if (ECOSYSTEM_SUMMARY[ecosystem.slug]) {
        return ECOSYSTEM_SUMMARY[ecosystem.slug];
    }

    const description = ecosystem.description?.replace(/\s+/g, " ").trim();

    if (!description) {
        return `Tools and workflows built around ${ecosystem.name}.`;
    }

    const firstSentence = description.split(/(?<=[.!?])\s+/)[0];
    return firstSentence.length > 130 ? `${firstSentence.slice(0, 127).trim()}...` : firstSentence;
}

export default function EcosystemCard({ ecosystem }: { ecosystem: EcosystemCardData }) {
    const brand = brandFor(ecosystem.slug);
    const previewTools = hasPreview(ecosystem) ? ecosystem.preview_tools : [];
    const visibleTools = previewTools.slice(0, 3);

    const style = {
        "--eco-accent": brand.accent,
    } as CSSProperties;

    return (
        <Link href={`/ecosystems/${ecosystem.slug}`} className="card ecosystem-card" style={style}>
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
                </div>
            </div>

            <p className="ecosystem-card-desc">
                {getShortDescription(ecosystem)}
            </p>

            {visibleTools.length > 0 && (
                <div className="ecosystem-card-tool-row" aria-label="Featured tools in this ecosystem">
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
            )}

            <div className="ecosystem-card-footer">
                <span>Explore</span>
                <span aria-hidden="true" className="ecosystem-card-arrow">&rarr;</span>
            </div>
        </Link>
    );
}
