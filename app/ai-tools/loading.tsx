import { ToolGridSkeleton } from "@/components/ui/tool-card-skeleton";

export default function Loading() {
    return (
        <div className="container-main browse-page">
            <div style={{ paddingTop: "24px", paddingBottom: "16px" }}>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "240px",
                        height: "32px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        marginBottom: "12px",
                    }}
                />
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "360px",
                        height: "16px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
            </div>
            <div style={{ marginTop: "24px" }}>
                <ToolGridSkeleton count={8} />
            </div>
        </div>
    );
}
