import { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Read the terms of service for MyCaptionAI.",
    alternates: {
        canonical: absoluteUrl("/terms"),
    },
    openGraph: {
        title: "Terms of Service",
        description: "Read the terms of service for MyCaptionAI.",
        url: absoluteUrl("/terms"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Service",
        description: "Read the terms of service for MyCaptionAI.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function TermsPage() {
    return (
        <div className="container-main">
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "56px 0 72px" }}>
                <h1 className="page-title">Terms of Service</h1>
                <p className="page-subtitle" style={{ maxWidth: "none" }}>
                    These terms govern your use of MyCaptionAI.
                </p>

                <div style={{ marginTop: "24px", display: "grid", gap: "20px", color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "15px" }}>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>Use of the Website</h2>
                        <p style={{ margin: 0 }}>
                            By using MyCaptionAI, you agree to use the site lawfully and not misuse any content, ranking signals, or submission forms.
                        </p>
                    </section>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>Content and Listings</h2>
                        <p style={{ margin: 0 }}>
                            We may update, edit, or remove listings and pages to maintain quality, accuracy, and compliance with policies.
                        </p>
                    </section>
                    <section>
                        <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>Liability</h2>
                        <p style={{ margin: 0 }}>
                            Tools are provided by third parties. Evaluate each product independently before use. MyCaptionAI is not responsible for third-party services.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
