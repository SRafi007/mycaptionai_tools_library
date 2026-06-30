"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
    aggregateLandscapeByCountry,
    type AiLandscapeRow,
    COUNTRY_MARKER_COORDS,
    type CountryLandscape,
} from "@/lib/ai-landscape";
import countryBoundaryPaths from "@/data/country-boundaries-paths.json";

const TOP_TOOL_LIMIT = 50;
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

const COUNTRY_ACCENTS: Record<string, string> = {
    US: "#2563EB",
    CA: "#2563EB",
    GB: "#2563EB",
    FR: "#2563EB",
    DE: "#2563EB",
    NL: "#2563EB",
    NO: "#2563EB",
    IL: "#2563EB",
    AE: "#2563EB",
    IN: "#2563EB",
    CN: "#2563EB",
    KR: "#2563EB",
    JP: "#2563EB",
};

const LABEL_POSITIONS: Record<string, "top" | "bottom" | "left" | "right"> = {
    US: "bottom",
    CA: "top",
    GB: "top",
    FR: "bottom",
    DE: "top",
    NL: "left",
    NO: "top",
    IL: "bottom",
    AE: "bottom",
    IN: "bottom",
    CN: "bottom",
    KR: "right",
    JP: "right",
};

function getAccent(iso: string): string {
    return COUNTRY_ACCENTS[iso] || "#2563EB";
}

function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const expanded = normalized.length === 3
        ? normalized.split("").map((char) => `${char}${char}`).join("")
        : normalized;
    const int = Number.parseInt(expanded, 16);
    if (Number.isNaN(int)) {
        return `rgba(37, 99, 235, ${alpha})`;
    }
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function AiCountryMap() {
    const [countries, setCountries] = useState<CountryLandscape[]>([]);
    const [selectedIso, setSelectedIso] = useState<string | null>(null);
    const [hoveredIso, setHoveredIso] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const dataModule = await import("@/data/global_ai_landscape.json");
                const aggregated = aggregateLandscapeByCountry(dataModule.default as AiLandscapeRow[]);
                if (!mounted) return;
                setCountries(aggregated);
                const defaultIso = aggregated.find((item) => COUNTRY_MARKER_COORDS[item.iso])?.iso || aggregated[0]?.iso || null;
                setSelectedIso(defaultIso);
            } catch (error) {
                if (!mounted) return;
                console.error("Failed to load global AI landscape data:", error);
                setLoadError("Could not load country map data.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const countryMap = useMemo(
        () => new Map(countries.map((country) => [country.iso, country])),
        [countries]
    );

    const sortedByCompanies = useMemo(
        () => [...countries].sort((a, b) => b.companyCount - a.companyCount),
        [countries]
    );

    const selectedCountry = selectedIso ? countryMap.get(selectedIso) || null : null;
    const highlightedTools = selectedCountry?.tools.slice(0, TOP_TOOL_LIMIT) || [];
    const selectedAccent = selectedCountry ? getAccent(selectedCountry.iso) : "#5ad8ff";
    const shellStyle = { "--country-accent": selectedAccent } as CSSProperties;

    if (loading) {
        return <div className="card country-map-loading">Loading AI innovation map...</div>;
    }

    if (loadError) {
        return <div className="card country-map-loading">{loadError}</div>;
    }

    return (
        <div className="country-map-stack" style={shellStyle}>
            <div className="country-rail" role="list" aria-label="AI leading countries">
                {sortedByCompanies.map((country) => {
                    const accent = getAccent(country.iso);
                    const isActive = country.iso === selectedIso;
                    const style = { "--rail-accent": accent } as CSSProperties;
                    return (
                        <button
                            key={`rail-${country.iso}`}
                            type="button"
                            role="listitem"
                            className={`country-rail-card ${isActive ? "is-active" : ""}`}
                            style={style}
                            onClick={() => setSelectedIso(country.iso)}
                            onMouseEnter={() => setHoveredIso(country.iso)}
                            onMouseLeave={() => setHoveredIso(null)}
                            aria-pressed={isActive}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                                alt=""
                                width={24}
                                height={18}
                                loading="lazy"
                                className="country-rail-flag"
                            />
                            <span className="country-rail-name">{country.country}</span>
                            <span className="country-rail-count">{country.companyCount}</span>
                        </button>
                    );
                })}
            </div>

            <div className="country-map-shell">
                <section className="card country-map-canvas">
                    <div className="country-map-stage">
                        <svg
                            className="country-map-svg"
                            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                            role="img"
                            aria-label="World map showing countries leading in AI innovation"
                        >
                            <defs>
                                <radialGradient id="country-map-vignette" cx="50%" cy="50%" r="70%">
                                    <stop offset="60%" stopColor="rgba(5, 10, 22, 0)" />
                                    <stop offset="100%" stopColor="rgba(2, 4, 10, 0.85)" />
                                </radialGradient>
                                <filter id="country-map-glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} className="country-map-bg" />

                            <image
                                href="/world-map-equirect.svg"
                                x={0}
                                y={0}
                                width={MAP_WIDTH}
                                height={MAP_HEIGHT}
                                preserveAspectRatio="xMidYMid meet"
                                className="country-map-world-image"
                            />

                            <rect
                                x="0"
                                y="0"
                                width={MAP_WIDTH}
                                height={MAP_HEIGHT}
                                fill="url(#country-map-vignette)"
                                pointerEvents="none"
                            />

                            <g>
                                {countries.map((country) => {
                                    const boundaryPath = (countryBoundaryPaths as Record<string, string>)[country.iso];
                                    if (!boundaryPath) return null;

                                    const accent = getAccent(country.iso);
                                    const isFocused = country.iso === selectedIso || country.iso === hoveredIso;
                                    const isSelected = country.iso === selectedIso;

                                    return (
                                        <path
                                            key={`boundary-${country.iso}`}
                                            d={boundaryPath}
                                            fill={hexToRgba(accent, isSelected ? 0.55 : isFocused ? 0.42 : 0.28)}
                                            stroke={accent}
                                            strokeWidth={isFocused ? 2.2 : 1.4}
                                            vectorEffect="non-scaling-stroke"
                                            className={`country-map-country-boundary ${isFocused ? "is-active" : ""}`}
                                            filter={isFocused ? "url(#country-map-glow)" : undefined}
                                            onMouseEnter={() => setHoveredIso(country.iso)}
                                            onMouseLeave={() => setHoveredIso(null)}
                                            onClick={() => setSelectedIso(country.iso)}
                                        />
                                    );
                                })}
                            </g>

                            <g>
                                {countries.map((country) => {
                                    const marker = COUNTRY_MARKER_COORDS[country.iso];
                                    if (!marker) return null;
                                    const accent = getAccent(country.iso);
                                    const isSelected = country.iso === selectedIso;
                                    return (
                                        <g key={`marker-${country.iso}`} transform={`translate(${marker.x}, ${marker.y})`}>
                                            {isSelected && (
                                                <circle
                                                    r="8"
                                                    fill="none"
                                                    stroke={accent}
                                                    strokeWidth="1.4"
                                                    className="country-map-marker-pulse"
                                                />
                                            )}
                                            <circle
                                                r="5"
                                                fill={accent}
                                                stroke="rgba(5, 10, 22, 0.9)"
                                                strokeWidth="1.6"
                                                className="country-map-marker-dot"
                                            />
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>

                        <div className="country-map-overlay-cards">
                            {countries.map((country) => {
                                const marker = COUNTRY_MARKER_COORDS[country.iso];
                                if (!marker) return null;
                                const accent = getAccent(country.iso);
                                const isFocused = country.iso === selectedIso || country.iso === hoveredIso;
                                const position = LABEL_POSITIONS[country.iso] || "bottom";
                                const style = {
                                    left: `${(marker.x / MAP_WIDTH) * 100}%`,
                                    top: `${(marker.y / MAP_HEIGHT) * 100}%`,
                                    "--label-accent": accent,
                                } as CSSProperties;

                                return (
                                    <button
                                        key={`label-${country.iso}`}
                                        type="button"
                                        className={`country-map-label pos-${position} ${isFocused ? "is-focused" : ""}`}
                                        style={style}
                                        onClick={() => setSelectedIso(country.iso)}
                                        onMouseEnter={() => setHoveredIso(country.iso)}
                                        onMouseLeave={() => setHoveredIso(null)}
                                        aria-label={`Select ${country.country}`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                                            alt=""
                                            width={18}
                                            height={13}
                                            loading="lazy"
                                            className="country-map-label-flag"
                                        />
                                        <span className="country-map-label-text">{country.country}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <aside className="card country-map-panel">
                    {selectedCountry ? (
                        <>
                            <div className="country-map-panel-header">
                                <div className="country-map-flag">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`}
                                        alt={`${selectedCountry.country} flag`}
                                        width={32}
                                        height={24}
                                        loading="lazy"
                                        className="country-map-panel-flag-icon"
                                    />
                                </div>
                                <div>
                                    <h2 className="country-map-country-name">{selectedCountry.country}</h2>
                                    <p className="country-map-country-meta">
                                        {selectedCountry.companyCount} companies | {selectedCountry.toolCount} tools
                                    </p>
                                </div>
                            </div>

                            <div className="country-map-metrics">
                                <span className="country-map-metric-chip">
                                    First tool date: {formatDate(selectedCountry.firstPublishedOn)}
                                </span>
                                <span className="country-map-metric-chip">
                                    Latest tool date: {formatDate(selectedCountry.lastPublishedOn)}
                                </span>
                            </div>

                            <div>
                                <h3 className="country-map-section-title">Highlighted Tools</h3>
                                <div className="country-map-tools">
                                    {highlightedTools.map((tool) =>
                                        tool.slug ? (
                                            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="country-map-tool-pill">
                                                {tool.name}
                                            </Link>
                                        ) : (
                                            <span key={tool.name} className="country-map-tool-pill static">
                                                {tool.name}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>

                            <Link
                                href={`/ai-by-country/${selectedCountry.countrySlug}`}
                                className="country-map-view-all-btn"
                            >
                                View all tools from {selectedCountry.country}
                            </Link>
                        </>
                    ) : (
                        <p className="country-map-empty-panel">No country selected.</p>
                    )}
                </aside>
            </div>

            <section className="section-padding section-border-t">
                <div className="section-header">
                    <h2 className="section-title">Country Leaderboard</h2>
                </div>
                <div className="card country-map-leaderboard-shell">
                    <table className="country-map-leaderboard">
                        <thead>
                            <tr>
                                <th>Flag</th>
                                <th>Country</th>
                                <th>Companies</th>
                                <th>Explore</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedByCompanies.map((country) => {
                                const isActive = country.iso === selectedIso;
                                return (
                                    <tr
                                        key={country.iso}
                                        className={isActive ? "is-active" : ""}
                                        onMouseEnter={() => setHoveredIso(country.iso)}
                                        onMouseLeave={() => setHoveredIso(null)}
                                    >
                                        <td className="country-map-leaderboard-flag">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                                                alt={`${country.country} flag`}
                                                width={20}
                                                height={15}
                                                loading="lazy"
                                                className="country-map-leaderboard-flag-icon"
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="country-map-country-btn"
                                                onClick={() => setSelectedIso(country.iso)}
                                            >
                                                <span>{country.country}</span>
                                            </button>
                                        </td>
                                        <td>
                                            <div className="country-map-company-list">
                                                {country.companies.slice(0, 6).map((company) => (
                                                    <span key={`${country.iso}-${company.name}`} className="country-map-company-badge">
                                                        {company.name}
                                                    </span>
                                                ))}
                                                {country.companies.length > 6 && (
                                                    <span className="country-map-company-badge more">
                                                        +{country.companies.length - 6} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Link href={`/ai-by-country/${country.countrySlug}`} className="btn-ghost btn-sm">
                                                View all
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
