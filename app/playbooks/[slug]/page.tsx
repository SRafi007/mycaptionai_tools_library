import { Metadata } from "next";
import { getPlaybookBySlug, getPublishedPlaybooks } from "@/lib/db/playbooks";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/lib/seo";
import PlaybookTimeline from "@/components/playbook-timeline";

export const revalidate = 3600; // Cache for 1 hour

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

    const shortDesc = getShortDescription(playbook.description);

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: playbook.title,
        description: playbook.description || `A step-by-step tech stack playbook showing how to use ${playbook.tools.map(t => t.name).join(", ")}.`,
        url: absoluteUrl(`/playbooks/${playbook.slug}`),
        step: playbook.tools.map((tool, index) => {
            const stepText = tool.step_description || "";
            return {
                "@type": "HowToStep",
                position: index + 1,
                name: `Step ${index + 1}: ${tool.step_title || `Use ${tool.name}`}`,
                text: stepText,
                url: absoluteUrl(`/tools/${tool.slug}`),
            };
        }),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
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
                        <PlaybookTimeline playbook={playbook} />
                    ) : (
                        <div className="empty-state">
                            <p>No tools listed in this playbook yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
