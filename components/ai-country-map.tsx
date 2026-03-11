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
    US: "#39d0ff",
    CA: "#7c4dff",
    GB: "#00e6a3",
    FR: "#ff5dc8",
    DE: "#ff9a3d",
    NL: "#59f0ff",
    NO: "#77ddff",
    IL: "#f1c40f",
    AE: "#00d1ff",
    IN: "#ff6d6d",
    CN: "#00f5d4",
    KR: "#7d7dff",
    JP: "#ff55b9",
};

const GRID_X_LINES = Array.from({ length: 17 }, (_, index) => Math.round((index * MAP_WIDTH) / 16));
const GRID_Y_LINES = Array.from({ length: 11 }, (_, index) => Math.round((index * MAP_HEIGHT) / 10));
const COUNTRY_CALLOUT_OFFSETS: Record<string, { dx: number; dy: number }> = {
    US: { dx: -12, dy: -58 },
    CA: { dx: -32, dy: -52 },
    GB: { dx: -6, dy: -52 },
    FR: { dx: 18, dy: -56 },
    DE: { dx: 18, dy: -54 },
    NL: { dx: -18, dy: -50 },
    NO: { dx: -6, dy: -46 },
    IL: { dx: 12, dy: -46 },
    AE: { dx: 14, dy: -45 },
    IN: { dx: 24, dy: -52 },
    CN: { dx: 24, dy: -56 },
    KR: { dx: 24, dy: -50 },
    JP: { dx: 26, dy: -52 },
};

function getMarkerAccent(iso: string): string {
    return COUNTRY_ACCENTS[iso] || "#5ad8ff";
}

function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const expanded = normalized.length === 3
        ? normalized.split("").map((char) => `${char}${char}`).join("")
        : normalized;
    const int = Number.parseInt(expanded, 16);
    if (Number.isNaN(int)) {
        return `rgba(90, 216, 255, ${alpha})`;
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
    const [supportsHover, setSupportsHover] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadLandscape = async () => {
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
        };

        loadLandscape();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

        const query = window.matchMedia("(hover: hover) and (pointer: fine)");
        const sync = () => setSupportsHover(query.matches);
        sync();

        const handleChange = () => sync();
        if (typeof query.addEventListener === "function") {
            query.addEventListener("change", handleChange);
            return () => query.removeEventListener("change", handleChange);
        }

        query.addListener(handleChange);
        return () => query.removeListener(handleChange);
    }, []);

    const countryMap = useMemo(
        () => new Map(countries.map((country) => [country.iso, country])),
        [countries]
    );

    const selectedCountry = selectedIso ? countryMap.get(selectedIso) || null : null;
    const highlightedTools = selectedCountry?.tools.slice(0, TOP_TOOL_LIMIT) || [];
    const selectedAccent = selectedCountry ? getMarkerAccent(selectedCountry.iso) : "#5ad8ff";
    const shellStyle = { "--country-accent": selectedAccent } as CSSProperties;
    const calloutIso = supportsHover ? hoveredIso : hoveredIso || selectedIso;
    const calloutCountry = calloutIso ? countryMap.get(calloutIso) || null : null;

    if (loading) {
        return (
            <div className="card country-map-loading">
                Loading AI innovation map...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="card country-map-loading">
                {loadError}
            </div>
        );
    }

    return (
        <div className="country-map-stack" style={shellStyle}>
            <div className="country-map-shell">
                <section className="card country-map-canvas">
                    <div className="country-map-stage">
                        <svg
                            className="country-map-svg"
                            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                            role="img"
                            aria-label="Global world map with highlighted AI country boundaries"
                        >
                            <defs>
                                <linearGradient id="country-map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f3f6fa" />
                                    <stop offset="54%" stopColor="#e8edf4" />
                                    <stop offset="100%" stopColor="#e1e8f0" />
                                </linearGradient>
                                <radialGradient id="country-map-glow" cx="50%" cy="45%" r="65%">
                                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                                    <stop offset="100%" stopColor="rgba(208, 220, 233, 0)" />
                                </radialGradient>
                            </defs>

                            <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} className="country-map-bg" />
                            <ellipse
                                cx={MAP_WIDTH / 2}
                                cy={MAP_HEIGHT / 2}
                                rx={MAP_WIDTH * 0.46}
                                ry={MAP_HEIGHT * 0.42}
                                fill="url(#country-map-glow)"
                                className="country-map-atmosphere"
                            />

                            <g className="country-map-graticule">
                                {GRID_X_LINES.map((x) => (
                                    <line key={`x-${x}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />
                                ))}
                                {GRID_Y_LINES.map((y) => (
                                    <line key={`y-${y}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />
                                ))}
                            </g>

                            <image
                                href="/world-map-equirect.svg"
                                x={0}
                                y={0}
                                width={MAP_WIDTH}
                                height={MAP_HEIGHT}
                                preserveAspectRatio="xMidYMid meet"
                                className="country-map-world-image"
                            />

                            <g>
                                {countries.map((country) => {
                                    const boundaryPath = (countryBoundaryPaths as Record<string, string>)[country.iso];
                                    if (!boundaryPath) return null;

                                    const accent = getMarkerAccent(country.iso);
                                    const isFocused = country.iso === selectedIso || country.iso === hoveredIso;

                                    return (
                                        <path
                                            key={`boundary-${country.iso}`}
                                            d={boundaryPath}
                                            fill={hexToRgba(accent, isFocused ? 0.3 : 0.15)}
                                            stroke={hexToRgba(accent, isFocused ? 1 : 0.9)}
                                            strokeWidth={isFocused ? 2.6 : 1.8}
                                            vectorEffect="non-scaling-stroke"
                                            className={`country-map-country-boundary ${isFocused ? "is-active" : ""}`}
                                            onMouseEnter={() => setHoveredIso(country.iso)}
                                            onMouseLeave={() => setHoveredIso(null)}
                                            onClick={() => setSelectedIso(country.iso)}
                                        />
                                    );
                                })}
                            </g>
                        </svg>

                        {calloutCountry && (() => {
                            const marker = COUNTRY_MARKER_COORDS[calloutCountry.iso];
                            if (!marker) return null;
                            const accent = getMarkerAccent(calloutCountry.iso);
                            const offset = COUNTRY_CALLOUT_OFFSETS[calloutCountry.iso] || { dx: 12, dy: -50 };
                            const companyPreview = calloutCountry.companies.slice(0, 3).map((item) => item.name).join(" | ");
                            const extraCount = Math.max(0, calloutCountry.companies.length - 3);
                            const style = {
                                left: `${(marker.x / MAP_WIDTH) * 100}%`,
                                top: `${(marker.y / MAP_HEIGHT) * 100}%`,
                                transform: `translate(${offset.dx}px, ${offset.dy}px)`,
                                "--callout-accent": accent,
                            } as CSSProperties;

                            return (
                                <div className="country-map-overlay-cards">
                                    <div
                                        className="country-map-overlay-card is-active"
                                        style={style}
                                    >
                                        <span className="country-map-overlay-title">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`https://flagcdn.com/w40/${calloutCountry.iso.toLowerCase()}.png`}
                                                alt={`${calloutCountry.country} flag`}
                                                width={16}
                                                height={12}
                                                loading="lazy"
                                                className="country-map-overlay-flag-icon"
                                            />
                                            <span>{calloutCountry.country}</span>
                                        </span>
                                        <span className="country-map-overlay-subline">
                                            {companyPreview}
                                            {extraCount > 0 ? ` +${extraCount}` : ""}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
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
                            {countries.map((country) => {
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
