import { Metadata } from "next";
import { getPublishedPlaybooks } from "@/lib/db/playbooks";
import PlaybookCard from "@/components/playbook-card";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
    title: "AI Playbooks & Tech Stacks",
    description: "Discover curated workflows and tool stacks to supercharge your AI usage.",
    alternates: {
        canonical: absoluteUrl("/playbooks"),
    },
};

export const revalidate = 60;

export default async function PlaybooksPage() {
    const playbooks = await getPublishedPlaybooks();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "AI Playbooks & Tech Stacks",
        description: "Discover curated workflows and tool stacks to supercharge your AI usage.",
        url: absoluteUrl("/playbooks"),
        mainEntity: {
            "@type": "ItemList",
            itemListElement: playbooks.map((pb, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                name: pb.title,
                url: absoluteUrl(`/playbooks/${pb.slug}`),
                description: pb.description || undefined,
            })),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container-main section-padding">
                <h1 className="hero-title" style={{ marginTop: "32px", marginBottom: "16px", textAlign: "left" }}>
                    AI Tech Stacks & Playbooks
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "48px", fontSize: "18px", maxWidth: "800px" }}>
                    Curated workflows combining the best tools. Instead of finding a single tool, find an entire solution.
                </p>
                <div className="tools-grid">
                    {playbooks.map((playbook) => (
                        <PlaybookCard key={playbook.id} playbook={playbook} />
                    ))}
                </div>
                {playbooks.length === 0 && (
                    <div className="empty-state">
                        <p>No playbooks published yet.</p>
                    </div>
                )}
            </div>
        </>
    );
}
