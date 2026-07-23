"use client";

import Link from "next/link";
import { useState } from "react";
import { Tool } from "@/types/tool";
import { upvoteToolAction } from "@/app/actions/upvote";
import { showToast } from "@/components/ui/toast";
import { ExternalLink } from "lucide-react";

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
    const [upvotes, setUpvotes] = useState(tool.upvotes || 0);
    const [hasVoted, setHasVoted] = useState(false);
    const [isUpvoting, setIsUpvoting] = useState(false);

    const hasVisualIcon = Boolean(tool.image_url || tool.icon_url);
    const visitUrl = tool.affiliate_url || tool.url;
    const visitRel = tool.affiliate_url ? "sponsored noopener noreferrer" : "noopener noreferrer";
    const hasDualActions = showUpvoteButton && showVisitButton && Boolean(visitUrl);

    async function handleUpvote(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (hasVoted || isUpvoting) return;

        // Optimistic UI update
        setUpvotes((prev) => prev + 1);
        setHasVoted(true);
        setIsUpvoting(true);
        showToast(`Upvoted ${tool.name}!`, "success");

        try {
            const res = await upvoteToolAction(tool.id, tool.slug, revalidatePaths);
            if (res.success && res.upvotes !== null) {
                setUpvotes(res.upvotes);
            }
        } catch {
            // Revert on error
            setUpvotes((prev) => Math.max(0, prev - 1));
            setHasVoted(false);
            showToast("Failed to register upvote", "error");
        } finally {
            setIsUpvoting(false);
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
                        {upvotes}
                    </span>
                </div>
                <div className={`tool-card-actions${hasDualActions ? " tool-card-actions-dual" : ""}`}>
                    {showUpvoteButton && (
                        <button
                            type="button"
                            onClick={handleUpvote}
                            disabled={hasVoted || isUpvoting}
                            className={`btn-outline btn-sm tool-upvote-btn ${hasVoted ? "voted" : ""}`}
                            style={hasVoted ? { borderColor: "var(--brand)", color: "var(--brand)" } : undefined}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={hasVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                            {hasVoted ? "Voted" : "Upvote"}
                        </button>
                    )}
                    {showVisitButton && visitUrl && (
                        <a href={visitUrl} target="_blank" rel={visitRel} className="btn-tag-style btn-secondary-tag btn-sm">
                            <span className="btn-tag-icon-box">
                                <ExternalLink size={10} />
                            </span>
                            <span>Visit</span>
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
