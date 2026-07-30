import React from "react";

export default function AIClipsSkeleton() {
    return (
        <div className="clips-root" style={{ pointerEvents: "none" }}>
            <div className="clips-body">
                {/* Left Stage Video Player Skeleton */}
                <div className="clips-stage">
                    <div className="clips-stage-row">
                        {/* Left Side Preview Card (Desktop) */}
                        <div className="side-preview clips-skeleton-pulse" />

                        {/* Center Reel Player Card Skeleton */}
                        <div className="clips-display clips-skeleton-player">
                            {/* Top Progress bar line */}
                            <div className="clip-progress">
                                <div
                                    className="clips-skeleton-pulse"
                                    style={{ width: "40%", height: "100%", borderRadius: "3px" }}
                                />
                            </div>

                            {/* Top Right Badge Skeleton */}
                            <div className="clips-skeleton-badge clips-skeleton-pulse" />

                            {/* Center Play Icon Glow Placeholder */}
                            <div className="clips-skeleton-center-icon clips-skeleton-pulse" />

                            {/* Anchored Bottom Overlay Footer Skeleton */}
                            <div className="clips-skeleton-footer">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div className="clips-skeleton-avatar clips-skeleton-pulse" />
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                                        <div
                                            className="clips-skeleton-text-line clips-skeleton-pulse"
                                            style={{ width: "45%" }}
                                        />
                                        <div
                                            className="clips-skeleton-text-line clips-skeleton-pulse"
                                            style={{ width: "30%", height: "10px" }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                                    <div
                                        className="clips-skeleton-text-line clips-skeleton-pulse"
                                        style={{ width: "85%", height: "14px" }}
                                    />
                                    <div
                                        className="clips-skeleton-text-line clips-skeleton-pulse"
                                        style={{ width: "60%", height: "14px" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Side Preview Card (Desktop) */}
                        <div className="side-preview clips-skeleton-pulse" />
                    </div>

                    {/* Stage Control Buttons & Dots Skeleton */}
                    <div className="clips-stage-controls">
                        <div className="ctrl-btn clips-skeleton-pulse" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
                        <div className="dots" style={{ gap: "6px" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="clips-skeleton-pulse"
                                    style={{
                                        width: i === 0 ? "20px" : "6px",
                                        height: "6px",
                                        borderRadius: i === 0 ? "3px" : "50%",
                                    }}
                                />
                            ))}
                        </div>
                        <div className="ctrl-btn clips-skeleton-pulse" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
                        <div className="mute-btn clips-skeleton-pulse" style={{ width: "42px", height: "42px", borderRadius: "50%" }} />
                    </div>
                </div>

                {/* Right Explore Feed Skeleton Sidebar */}
                <div className="clips-explore">
                    <div className="drag-handle">
                        <div />
                    </div>
                    <div className="explore-header">
                        <div className="clips-skeleton-text-line clips-skeleton-pulse" style={{ width: "120px", height: "18px" }} />
                        <div className="clips-skeleton-text-line clips-skeleton-pulse" style={{ width: "60px", height: "12px" }} />
                    </div>
                    <div className="explore-list">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="feed-item" style={{ border: "1px solid transparent" }}>
                                <div className="feed-thumb clips-skeleton-pulse" />
                                <div className="feed-info" style={{ flex: 1 }}>
                                    <div
                                        className="clips-skeleton-text-line clips-skeleton-pulse"
                                        style={{ width: idx % 2 === 0 ? "90%" : "75%", height: "14px" }}
                                    />
                                    <div
                                        className="clips-skeleton-text-line clips-skeleton-pulse"
                                        style={{ width: "55%", height: "12px", marginTop: "4px" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
