import { ToolGridSkeleton } from "@/components/ui/tool-card-skeleton";

export default function Loading() {
    return (
        <div className="container-main">
            <div style={{ paddingTop: "24px", paddingBottom: "16px" }}>
                <div
                    className="skeleton-pulse"
                    style={{
                        width: "200px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "var(--bg-surface-hover, #2a2b36)",
                        marginBottom: "12px",
                    }}
                />
            </div>
            <div style={{ marginTop: "16px" }}>
                <ToolGridSkeleton count={6} />
            </div>
        </div>
    );
}
