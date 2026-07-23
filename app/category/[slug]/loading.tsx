import { ToolGridSkeleton } from "@/components/ui/tool-card-skeleton";

export default function Loading() {
    return (
        <div className="container-main">
            <div style={{ paddingTop: "24px", paddingBottom: "16px" }}>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "280px",
                        height: "36px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        marginBottom: "12px",
                    }}
                />
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "480px",
                        height: "16px",
                        borderRadius: "4px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                    }}
                />
            </div>
            <div style={{ marginTop: "24px" }}>
                <ToolGridSkeleton count={9} />
            </div>
        </div>
    );
}
