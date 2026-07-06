import { Metadata } from "next";
import { getEcosystems } from "@/lib/db/ecosystems";
import EcosystemCard from "@/components/ecosystem-card";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
    title: "AI Ecosystems & Hubs",
    description: "Discover the best tools and playbooks built around major AI foundational models.",
    alternates: {
        canonical: absoluteUrl("/ecosystems"),
    },
};

export const revalidate = 21600; // Cache for 6 hours

export default async function EcosystemsPage() {
    const ecosystems = await getEcosystems();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "AI Ecosystems & Hubs",
        description: "Discover the best tools and playbooks built around major AI foundational models.",
        url: absoluteUrl("/ecosystems"),
        mainEntity: {
            "@type": "ItemList",
            itemListElement: ecosystems.map((eco, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                name: eco.name,
                url: absoluteUrl(`/ecosystems/${eco.slug}`),
                description: eco.description || undefined,
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
                    AI Giants Ecosystems
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "48px", fontSize: "18px", maxWidth: "800px" }}>
                    Explore curated hubs for the leading AI models. Find the best UI clients, extensions, and workflows explicitly designed to supercharge models like Claude, GPT-4, and Gemini.
                </p>
                <div className="tools-grid">
                    {ecosystems.map((eco) => (
                        <EcosystemCard key={eco.id} ecosystem={eco} />
                    ))}
                </div>
                {ecosystems.length === 0 && (
                    <div className="empty-state">
                        <p>No ecosystems found yet.</p>
                    </div>
                )}
            </div>
        </>
    );
}
