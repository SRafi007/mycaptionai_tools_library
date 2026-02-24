import { Metadata } from "next";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
    title: `About ${SITE_NAME} - The AI Tools Directory Built for Creators`,
    description:
        `Learn about ${SITE_NAME}'s mission to help creators, marketers, and developers discover and compare the best AI tools.`,
    alternates: {
        canonical: absoluteUrl("/about"),
    },
    openGraph: {
        title: `About ${SITE_NAME}`,
        description: `Learn about ${SITE_NAME}'s mission to help creators, marketers, and developers discover and compare AI tools.`,
        url: absoluteUrl("/about"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: `About ${SITE_NAME}`,
        description: `Learn about ${SITE_NAME}'s mission to help creators, marketers, and developers discover and compare AI tools.`,
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function AboutPage() {
    return (
        <div className="container-main">
            <div style={{ maxWidth: "680px", margin: "0 auto", padding: "64px 0" }}>
                <h1 className="page-title" style={{ textAlign: "center" }}>About MyCaptionAI</h1>
                <p
                    className="page-subtitle"
                    style={{ textAlign: "center", margin: "8px auto 48px", maxWidth: "520px" }}
                >
                    The AI tools directory built for creators, marketers, and developers.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <Section title="Our Mission">
                        The AI landscape is exploding - thousands of tools launching every month. Finding the
                        right one should not require hours of research. MyCaptionAI curates, rates, and
                        organizes AI tools so you can find what you need in seconds.
                    </Section>

                    <Section title="What We Offer">
                        <ul style={{ margin: "12px 0 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <li><strong>4,200+ AI tools</strong> across 71 categories</li>
                            <li><strong>Honest ratings</strong> and user-driven upvotes</li>
                            <li><strong>Smart discovery</strong> - search, browse, filter by pricing</li>
                            <li><strong>Always free</strong> to use - no signup required</li>
                            <li><strong>Updated regularly</strong> with new tools and categories</li>
                        </ul>
                    </Section>

                    <Section title="For Tool Builders">
                        If you have built an AI tool, we would love to feature it. Submit your tool for
                        free and get discovered by thousands of potential users.
                    </Section>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h2
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                    margin: "0 0 12px",
                }}
            >
                {title}
            </h2>
            <div style={{ fontSize: "15px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                {children}
            </div>
        </div>
    );
}
