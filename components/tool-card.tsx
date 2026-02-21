import Link from "next/link";
import { Tool } from "@/types/tool";
import RatingStars from "@/components/rating-stars";

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

export default function ToolCard({ tool }: { tool: Tool }) {
    return (
        <Link href={`/tools/${tool.slug}`} className="tool-card-link">
            <article className="card tool-card">
                {/* Top Row */}
                <div className="tool-card-header">
                    <div className="tool-card-identity">
                        {/* Icon */}
                        <div
                            className="tool-card-icon"
                            style={{
                                background:
                                    tool.image_url || tool.icon_url
                                        ? `url(${tool.icon_url || tool.image_url}) center/cover`
                                        : "var(--accent-muted)",
                            }}
                        >
                            {!tool.image_url && !tool.icon_url && (
                                <span>{tool.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        <div>
                            <h3 className="tool-card-name">{tool.name}</h3>
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

                {/* Description */}
                {(tool.short_description || tool.description) && (
                    <p className="tool-card-desc">
                        {tool.short_description || tool.description}
                    </p>
                )}

                {/* Bottom Row */}
                <div className="tool-card-footer">
                    <div className="tool-card-meta">
                        {tool.rating_score > 0 && (
                            <RatingStars score={tool.rating_score} count={tool.rating_count} />
                        )}
                        {tool.upvotes > 0 && (
                            <span className="tool-card-upvotes">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                                {tool.upvotes}
                            </span>
                        )}
                    </div>
                    <span className="tool-card-arrow">View →</span>
                </div>
            </article>
        </Link>
    );
}
