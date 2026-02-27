import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Tool } from "@/types/tool";
import { incrementToolUpvotes } from "@/lib/db/tools";

function getPricingBadgeClass(pricingType: Tool["pricing_type"]): string {
    switch (pricingType) {
        case "Free":
            return "badge badge-free";
        case "Freemium":
            return "badge badge-freemium";
        case "Paid":
            return "badge badge-paid";
        case "Free-Trial":
            return "badge badge-freemium";
        case "Contact":
            return "badge badge-contact";
        default:
            return "badge badge-free";
    }
}

function getPricingLabel(pricingType: Tool["pricing_type"]): string {
    switch (pricingType) {
        case "Free-Trial":
            return "Free Trial";
        case "Contact":
            return "Contact";
        default:
            return pricingType || "Free";
    }
}

interface ToolCardProps {
    tool: Tool;
    showVisitButton?: boolean;
    showUpvoteButton?: boolean;
    revalidatePaths?: string[];
}

export default function ToolCard({
    tool,
    showVisitButton = true,
    showUpvoteButton = false,
    revalidatePaths = [],
}: ToolCardProps) {
    const hasVisualIcon = Boolean(tool.image_url || tool.icon_url);
    const hasDualActions = showUpvoteButton && showVisitButton && Boolean(tool.url);
    const pathsToRevalidate = revalidatePaths.filter((path, index, arr) => path.startsWith("/") && arr.indexOf(path) === index);

    async function upvoteTool() {
        "use server";

        await incrementToolUpvotes(tool.id);
        revalidatePath(`/tools/${tool.slug}`);
        for (const path of pathsToRevalidate) {
            revalidatePath(path);
        }
    }

    return (
        <article className="card tool-card">
            <div className="tool-card-header">
                <div className="tool-card-identity">
                    <div
                        className={`tool-card-icon ${hasVisualIcon ? "tool-card-icon-image" : "tool-card-icon-fallback"}`}
                        style={
                            hasVisualIcon
                                ? { background: `url(${tool.icon_url || tool.image_url}) center/cover` }
                                : undefined
                        }
                    >
                        {!hasVisualIcon && (
                            <span>{tool.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <div className="tool-card-title-wrap">
                        <h3 className="tool-card-name">
                            <Link href={`/tools/${tool.slug}`} className="tool-card-name-link">
                                {tool.name}
                            </Link>
                        </h3>
                        {tool.is_verified && (
                            <span className="tool-card-verified">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                Verified
                            </span>
                        )}
                    </div>
                </div>

                {tool.pricing_type && (
                    <span className={getPricingBadgeClass(tool.pricing_type)}>
                        {getPricingLabel(tool.pricing_type)}
                    </span>
                )}
            </div>

            {(tool.short_description || tool.description) && (
                <p className="tool-card-desc">
                    {tool.short_description || tool.description}
                </p>
            )}

            <div className="tool-card-footer">
                <div className="tool-card-meta">
                    <span className="tool-card-rating">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {(tool.rating_score || 0).toFixed(1)}
                    </span>
                    <span className="tool-card-upvotes">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        {tool.upvotes || 0}
                    </span>
                </div>
                <div className={`tool-card-actions${hasDualActions ? " tool-card-actions-dual" : ""}`}>
                    {showUpvoteButton && (
                        <form action={upvoteTool}>
                            <button type="submit" className="btn-outline btn-sm tool-upvote-btn">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                                Upvote
                            </button>
                        </form>
                    )}
                    {showVisitButton && tool.url && (
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
                            Visit
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
