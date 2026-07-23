import React from "react";

export function ToolCardSkeleton() {
    return (
        <div className="card tool-card skeleton-card" style={{ pointerEvents: "none" }}>
            <div className="tool-card-header">
                <div className="tool-card-identity" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                        className="skeleton-pulse"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "8px",
                            backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: "120px",
                                height: "16px",
                                borderRadius: "4px",
                                backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                            }}
                        />
                        <div
                            className="skeleton-pulse"
                            style={{
                                width: "60px",
                                height: "12px",
                                borderRadius: "4px",
                                backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                            }}
                        />
                    </div>
                </div>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "54px",
                        height: "20px",
                        borderRadius: "12px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
            </div>

            <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "100%",
                        height: "14px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "75%",
                        height: "14px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
            </div>

            <div className="tool-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                    <div
                        className="skeleton-pulse"
                        style={{
                            width: "36px",
                            height: "14px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        }}
                    />
                    <div
                        className="skeleton-pulse"
                        style={{
                            width: "36px",
                            height: "14px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        }}
                    />
                </div>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "60px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
            </div>
        </div>
    );
}

export function ToolGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="tools-grid">
            {Array.from({ length: count }).map((_, i) => (
                <ToolCardSkeleton key={i} />
            ))}
        </div>
    );
}
