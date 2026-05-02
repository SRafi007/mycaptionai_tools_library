"use client";

import { useState } from "react";
import Link from "next/link";

interface EcoToolData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    url: string | null;
    icon_url: string | null;
    image_url: string | null;
    role_category: string | null;
    ecosystem_summary?: string | null;
    when_to_use?: string | null;
    best_for?: string | null;
    use_case_examples?: string[] | null;
    recommendation?: string | null;
    content_status?: string | null;
}

export default function EcosystemDetailCard({ tool }: { tool: EcoToolData }) {
    const [expanded, setExpanded] = useState(false);

    const hasGuidance = !!(tool.when_to_use || tool.recommendation || (tool.use_case_examples && tool.use_case_examples.length > 0));

    const summary = tool.ecosystem_summary || tool.short_description || tool.description;
    const truncatedSummary = summary && summary.length > 120 ? summary.slice(0, 117).trim() + "…" : summary;

    return (
        <article className={`eco-detail-card ${expanded ? "eco-detail-card--open" : ""}`}>
            {/* Accent bar */}
            <div className="eco-detail-card-accent" aria-hidden="true" />

            <div className="eco-detail-card-body">
                {/* Header: icon + name + best-for */}
                <div className="eco-detail-card-head">
                    <div
                        className={`eco-detail-card-icon ${tool.icon_url || tool.image_url ? "eco-detail-card-icon--img" : ""}`}
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

                    <div className="eco-detail-card-titles">
                        <h3 className="eco-detail-card-name">
                            <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                        </h3>
                        {tool.best_for && (
                            <span className="eco-detail-card-bestfor">{tool.best_for}</span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="eco-detail-card-desc">{truncatedSummary}</p>

                {/* Use case tags */}
                {tool.use_case_examples && tool.use_case_examples.length > 0 && (
                    <div className="eco-detail-card-tags">
                        {tool.use_case_examples.slice(0, 3).map((uc) => (
                            <span key={uc} className="eco-detail-card-tag">{uc}</span>
                        ))}
                    </div>
                )}

                {/* Expandable guidance */}
                {hasGuidance && expanded && (
                    <div className="eco-detail-card-guidance">
                        {tool.when_to_use && (
                            <div className="eco-detail-card-guidance-block">
                                <span className="eco-detail-card-guidance-label">When to use</span>
                                <p>{tool.when_to_use}</p>
                            </div>
                        )}
                        {tool.recommendation && (
                            <div className="eco-detail-card-guidance-block">
                                <span className="eco-detail-card-guidance-label">Recommendation</span>
                                <p>{tool.recommendation}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="eco-detail-card-footer">
                    <div className="eco-detail-card-actions">
                        {hasGuidance && (
                            <button
                                className="eco-detail-card-expand"
                                onClick={() => setExpanded(!expanded)}
                                aria-expanded={expanded}
                            >
                                {expanded ? "Less" : "Details"}
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded ? "rotate(180deg)" : undefined, transition: "transform 200ms ease" }}>
                                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="eco-detail-card-links">
                        <Link href={`/tools/${tool.slug}`} className="eco-detail-card-link">
                            View
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        {tool.url && (
                            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="eco-detail-card-visit">
                                Visit ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
