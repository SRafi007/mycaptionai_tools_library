import { Metadata } from "next";
import { getPlaybookBySlug, getPublishedPlaybooks } from "@/lib/db/playbooks";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
    const playbooks = await getPublishedPlaybooks();
    return playbooks.map((pb) => ({
        slug: pb.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const playbook = await getPlaybookBySlug(resolvedParams.slug);
    if (!playbook) return { title: "Not Found" };

    return {
        title: `${playbook.title} | AI Playbooks`,
        description: playbook.description || `View the ${playbook.title} playbook.`,
        alternates: {
            canonical: absoluteUrl(`/playbooks/${playbook.slug}`),
        },
    };
}

const flowXPattern = [22, 72, 38, 78, 29, 63];

function getFlowPosition(index: number, total: number) {
    const y = total <= 1 ? 50 : 16 + (index * 68) / (total - 1);
    return {
        x: flowXPattern[index % flowXPattern.length],
        y,
    };
}

/**
 * Elbow connector: goes vertically from `from`, then horizontally to `to.x`,
 * then vertically down to `to`. Rounded corners via arc commands.
 */
function getEdgePath(from: { x: number; y: number }, to: { x: number; y: number }) {
    const r = 1.8; // corner radius in viewBox units
    const midY = from.y + (to.y - from.y) * 0.45;
    const dx = to.x - from.x;
    const sx = dx > 0 ? 1 : -1; // sweep direction

    return [
        `M ${from.x} ${from.y}`,
        `L ${from.x} ${midY - r}`,
        `Q ${from.x} ${midY}, ${from.x + sx * r} ${midY}`,
        `L ${to.x - sx * r} ${midY}`,
        `Q ${to.x} ${midY}, ${to.x} ${midY + r}`,
        `L ${to.x} ${to.y}`,
    ].join(" ");
}

/**
 * Split step_description into a hook (before the first colon) and body (after).
 * e.g. "Plan the brief: Ask ChatGPT to turn …" → hook="Plan the brief", body="Ask ChatGPT to turn …"
 */
function splitStepDescription(desc?: string | null): { hook: string; body: string | null } {
    if (!desc) return { hook: "Use this tool as part of the stack.", body: null };
    const colonIdx = desc.indexOf(":");
    if (colonIdx === -1 || colonIdx > 60) return { hook: desc, body: null };
    return {
        hook: desc.slice(0, colonIdx).trim(),
        body: desc.slice(colonIdx + 1).trim() || null,
    };
}

function getShortDescription(description?: string | null, maxLen = 160) {
    const clean = description?.replace(/\s+/g, " ").trim();
    if (!clean) return null;
    if (clean.length <= maxLen) return clean;
    return `${clean.slice(0, maxLen).trim()}…`;
}

export default async function PlaybookDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const playbook = await getPlaybookBySlug(resolvedParams.slug);

    if (!playbook) {
        notFound();
    }

    const flowPositions = playbook.tools.map((_, index) => getFlowPosition(index, playbook.tools.length));
    const flowHeight = Math.max(920, 210 * playbook.tools.length);
    const shortDesc = getShortDescription(playbook.description);

    return (
        <div className="container-main playbook-detail-page">
            <section className="playbook-hero-compact">
                <div className="playbook-title-row">
                    <h1 className="playbook-detail-title">{playbook.title}</h1>

                    {playbook.tools.length > 0 && (
                        <span className="playbook-tool-count-badge">
                            {playbook.tools.length} connected tools
                        </span>
                    )}
                </div>

                {shortDesc && (
                    <p className="playbook-inline-description">{shortDesc}</p>
                )}

                {playbook.ecosystem && (
                    <div className="playbook-ecosystem-chip">
                        <span>Built around</span>
                        <strong>{playbook.ecosystem.name}</strong>
                    </div>
                )}
            </section>

            <section className="playbook-workflow-section" aria-labelledby="playbook-workflow-title">

                {playbook.tools.length > 0 ? (
                    <div
                        className="playbook-flow-canvas dot-grid"
                        style={{ "--flow-height": `${flowHeight}px` } as CSSProperties}
                    >
                        <svg
                            className="playbook-flow-edges"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <defs>
                                <linearGradient id="playbook-edge-gradient" x1="0" x2="1" y1="0" y2="1">
                                    <stop offset="0%" stopColor="var(--brand-500)" />
                                    <stop offset="58%" stopColor="var(--secondary-accent)" />
                                    <stop offset="100%" stopColor="var(--highlight-accent)" />
                                </linearGradient>
                            </defs>
                            {flowPositions.slice(0, -1).map((position, index) => (
                                <path
                                    key={`${playbook.tools[index].id}-${playbook.tools[index + 1].id}`}
                                    d={getEdgePath(position, flowPositions[index + 1])}
                                />
                            ))}
                        </svg>

                        <ol className="playbook-flow-nodes">
                            {playbook.tools.map((tool, index) => {
                                const position = flowPositions[index];
                                const hasVisualIcon = Boolean(tool.image_url || tool.icon_url);
                                const { hook, body } = splitStepDescription(tool.step_description);

                                return (
                                    <li
                                        key={`${tool.id}-${index}`}
                                        className="playbook-flow-node"
                                        style={{
                                            "--node-x": `${position.x}%`,
                                            "--node-y": `${position.y}%`,
                                            "--node-index": index,
                                        } as CSSProperties}
                                    >
                                        <article className="playbook-node-card">
                                            {/* Top bar: [logo  tool_name  |  step N] */}
                                            <div className="playbook-node-topbar">
                                                <div className="playbook-node-identity">
                                                    <div
                                                        className={`playbook-node-icon ${hasVisualIcon ? "playbook-node-icon-image" : "playbook-node-icon-fallback"}`}
                                                        style={
                                                            hasVisualIcon
                                                                ? { backgroundImage: `url(${tool.icon_url || tool.image_url})` }
                                                                : undefined
                                                        }
                                                        aria-hidden="true"
                                                    >
                                                        {!hasVisualIcon && tool.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <h3 className="playbook-node-title">
                                                        <Link href={`/tools/${tool.slug}`}>{tool.name}</Link>
                                                    </h3>
                                                </div>
                                                <span className="playbook-step-pill">
                                                    Step {String(tool.step_order || index + 1).padStart(2, "0")}
                                                </span>
                                            </div>

                                            {/* Hook line */}
                                            <p className="playbook-node-hook">{hook}</p>

                                            {/* Body text */}
                                            {body && (
                                                <p className="playbook-node-body">{body}</p>
                                            )}
                                        </article>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No tools listed in this playbook yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
