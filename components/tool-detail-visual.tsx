"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

interface ToolDetailVisualProps {
    variant: "icon" | "banner";
    name: string;
    imageUrl?: string | null;
    iconUrl?: string | null;
    pricingLabel?: string | null;
    category?: string | null;
    isVerified?: boolean;
}

function getInitials(name: string): string {
    const parts = name
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);

    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function buildCandidates(urls: Array<string | null | undefined>): string[] {
    return Array.from(
        new Set(
            urls
                .map((url) => url?.trim())
                .filter((url): url is string => Boolean(url))
        )
    );
}

function ToolIcon({
    name,
    imageUrl,
    iconUrl,
}: Pick<ToolDetailVisualProps, "name" | "imageUrl" | "iconUrl">) {
    const candidates = useMemo(() => buildCandidates([iconUrl, imageUrl]), [iconUrl, imageUrl]);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const currentSrc = candidates[candidateIndex] || null;

    function handleError() {
        setCandidateIndex((index) => index + 1);
    }

    return (
        <div className="tool-detail-icon tool-detail-icon-shell">
            {currentSrc ? (
                <Image
                    src={currentSrc}
                    alt={`${name} logo`}
                    fill
                    unoptimized
                    sizes="56px"
                    className="tool-detail-icon-image"
                    onError={handleError}
                />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </div>
    );
}

function ToolBanner({
    name,
    imageUrl,
    iconUrl,
    pricingLabel,
    category,
    isVerified = false,
}: Omit<ToolDetailVisualProps, "variant">) {
    const bannerCandidates = useMemo(() => buildCandidates([imageUrl]), [imageUrl]);
    const emblemCandidates = useMemo(() => buildCandidates([iconUrl, imageUrl]), [iconUrl, imageUrl]);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [emblemIndex, setEmblemIndex] = useState(0);
    const currentBanner = bannerCandidates[bannerIndex] || null;
    const currentEmblem = emblemCandidates[emblemIndex] || null;

    function handleBannerError() {
        setBannerIndex((index) => index + 1);
    }

    function handleEmblemError() {
        setEmblemIndex((index) => index + 1);
    }

    if (currentBanner) {
        return (
            <div className="tool-detail-banner">
                <Image
                    src={currentBanner}
                    alt={`${name} screenshot`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    className="tool-detail-banner-media"
                    onError={handleBannerError}
                />
            </div>
        );
    }

    return (
        <div className="tool-detail-banner tool-detail-banner-fallback">
            <div className="tool-detail-banner-top">
                <span className="tool-detail-banner-pill">Preview unavailable</span>
                <div className="tool-detail-banner-chip-row">
                    {category && (
                        <span className="tool-detail-banner-chip">{category}</span>
                    )}
                    {pricingLabel && (
                        <span className="tool-detail-banner-chip">{pricingLabel}</span>
                    )}
                    {isVerified && (
                        <span className="tool-detail-banner-chip">Verified listing</span>
                    )}
                </div>
            </div>

            <div className="tool-detail-banner-body">
                <div className="tool-detail-fallback-mark">
                    {currentEmblem ? (
                        <Image
                            src={currentEmblem}
                            alt={`${name} visual fallback`}
                            fill
                            unoptimized
                            sizes="88px"
                            className="tool-detail-fallback-mark-image"
                            onError={handleEmblemError}
                        />
                    ) : (
                        <span>{getInitials(name)}</span>
                    )}
                </div>
                <div className="tool-detail-banner-copy">
                    <p className="tool-detail-banner-kicker">Creative Fallback</p>
                    <h2>{name}</h2>
                    <p>
                        The live screenshot could not be loaded, so this page switched to a branded preview card instead of leaving a broken image behind.
                    </p>
                </div>
            </div>

            <div className="tool-detail-banner-stats">
                <article className="tool-detail-banner-stat">
                    <span className="tool-detail-banner-stat-label">Visual status</span>
                    <strong className="tool-detail-banner-stat-value">Fallback active</strong>
                </article>
                <article className="tool-detail-banner-stat">
                    <span className="tool-detail-banner-stat-label">Listing mode</span>
                    <strong className="tool-detail-banner-stat-value">Still browseable</strong>
                </article>
                <article className="tool-detail-banner-stat">
                    <span className="tool-detail-banner-stat-label">Tool profile</span>
                    <strong className="tool-detail-banner-stat-value">Data intact</strong>
                </article>
            </div>
        </div>
    );
}

export default function ToolDetailVisual(props: ToolDetailVisualProps) {
    if (props.variant === "icon") {
        return <ToolIcon name={props.name} imageUrl={props.imageUrl} iconUrl={props.iconUrl} />;
    }

    return (
        <ToolBanner
            name={props.name}
            imageUrl={props.imageUrl}
            iconUrl={props.iconUrl}
            pricingLabel={props.pricingLabel}
            category={props.category}
            isVerified={props.isVerified}
        />
    );
}
