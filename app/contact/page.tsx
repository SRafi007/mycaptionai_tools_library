import { Metadata } from "next";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
    title: `Contact Us - ${SITE_NAME}`,
    description:
        `Have questions, feedback, or sponsorship inquiries? Contact ${SITE_NAME} to get in touch with our team.`,
    alternates: {
        canonical: absoluteUrl("/contact"),
    },
    openGraph: {
        title: `Contact Us - ${SITE_NAME}`,
        description: `Have questions, feedback, or sponsorship inquiries? Contact ${SITE_NAME} to get in touch with our team.`,
        url: absoluteUrl("/contact"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: `Contact Us - ${SITE_NAME}`,
        description: `Have questions, feedback, or sponsorship inquiries? Contact ${SITE_NAME} to get in touch with our team.`,
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function ContactPage() {
    return (
        <div className="container-main">
            <div className="contact-container">
                <div className="contact-header">
                    <h1 className="contact-title">Contact Us</h1>
                    <p className="contact-subtitle">
                        Have questions, feedback, or inquiries about sponsorship, partnerships, or reporting issues? We'd love to hear from you.
                    </p>
                </div>
                
                <ContactForm />
                
                <div style={{ marginTop: "40px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <p>
                        Alternatively, you can email us directly at{" "}
                        <a href="mailto:support@mycaption.ai" style={{ color: "var(--accent)", fontWeight: 500 }}>
                            support@mycaption.ai
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
