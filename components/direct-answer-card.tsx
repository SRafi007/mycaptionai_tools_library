import React from "react";

interface DirectAnswerCardProps {
    title: string;
    summary: string;
    badgeLabel?: string;
    highlights?: { label: string; value: string }[];
}

/**
 * A Direct Answer Summary Card designed for featured snippet extraction by
 * traditional search engines (SEO) and conversational answer engines (AEO / Perplexity / ChatGPT).
 */
export default function DirectAnswerCard({
    title,
    summary,
    badgeLabel = "Direct Overview",
    highlights = [],
}: DirectAnswerCardProps) {
    return (
        <aside
            className="direct-answer-card card"
            aria-label="Summary overview"
            style={{
                marginBottom: "24px",
                padding: "16px 20px",
                borderRadius: "12px",
                border: "1px solid var(--border-default, #242533)",
                backgroundColor: "var(--bg-surface, #24252f)",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(36, 37, 47, 0.95) 100%)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: "0.02em" }}>
                    {title}
                </h2>
                <span
                    className="badge"
                    style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: "rgba(99, 102, 241, 0.15)",
                        color: "var(--brand, #6366f1)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "100px",
                    }}
                >
                    ⚡ {badgeLabel}
                </span>
            </div>

            <p
                style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                    margin: 0,
                    fontWeight: 400,
                }}
            >
                {summary}
            </p>

            {highlights.length > 0 && (
                <div
                    style={{
                        marginTop: "12px",
                        paddingTop: "10px",
                        borderTop: "1px dashed var(--border-default, #242533)",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}
                >
                    {highlights.map((h, idx) => (
                        <div key={idx} style={{ fontSize: "12px" }}>
                            <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>{h.label}:</span>
                            <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{h.value}</strong>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}
