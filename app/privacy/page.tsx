import { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Read the privacy policy for MyCaptionAI.",
    alternates: {
        canonical: absoluteUrl("/privacy"),
    },
    openGraph: {
        title: "Privacy Policy",
        description: "Read the privacy policy for MyCaptionAI.",
        url: absoluteUrl("/privacy"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy",
        description: "Read the privacy policy for MyCaptionAI.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function PrivacyPage() {
    return (
        <div className="container-main">
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 0 72px" }}>
                <h1 className="page-title">Privacy Policy</h1>
                <p className="page-subtitle" style={{ maxWidth: "none" }}>
                    This policy explains how MyCaptionAI collects and uses information.
                </p>

                <div style={{ marginTop: "24px", display: "grid", gap: "20px", color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "15px" }}>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>Information We Collect</h2>
                        <p style={{ margin: 0 }}>
                            We collect basic analytics and optional submission form data so we can improve the directory and review tool submissions.
                        </p>
                    </section>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>How We Use Data</h2>
                        <p style={{ margin: 0 }}>
                            Data is used to operate the site, analyze usage trends, prevent abuse, and process submitted tools.
                        </p>
                    </section>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>Contact</h2>
                        <p style={{ margin: 0 }}>
                            If you have privacy questions, contact us through the submission/contact channel listed on the website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
