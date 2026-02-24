import { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Submit Your AI Tool - Get Listed Free",
    description:
        "Submit your AI tool to MyCaptionAI's directory and get discovered by thousands of creators, marketers, and developers.",
    alternates: {
        canonical: absoluteUrl("/submit"),
    },
    openGraph: {
        title: "Submit Your AI Tool - Get Listed Free",
        description: "Submit your AI tool to get discovered by creators, marketers, and developers.",
        url: absoluteUrl("/submit"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
    twitter: {
        card: "summary_large_image",
        title: "Submit Your AI Tool - Get Listed Free",
        description: "Submit your AI tool to get discovered by creators, marketers, and developers.",
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

export default function SubmitPage() {
    return (
        <div className="container-main">
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "64px 0" }}>
                <h1 className="page-title" style={{ textAlign: "center" }}>
                    Submit Your AI Tool
                </h1>
                <p
                    className="page-subtitle"
                    style={{ textAlign: "center", margin: "8px auto 40px", maxWidth: "480px" }}
                >
                    Get your tool listed in front of thousands of creators, marketers, and developers. It&apos;s free.
                </p>

                <form
                    className="card"
                    style={{ padding: "32px" }}
                    action="https://formspree.io/f/placeholder"
                    method="POST"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <FormField label="Tool Name" name="name" required placeholder="e.g. ChatGPT" />
                        <FormField label="Official URL" name="url" type="url" required placeholder="https://..." />
                        <FormField label="Short Description" name="description" required placeholder="What does your tool do? (1-2 sentences)" />
                        <FormField label="Category" name="category" required placeholder="e.g. Writing, Image Generation..." />
                        <div>
                            <label
                                htmlFor="pricing"
                                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}
                            >
                                Pricing
                            </label>
                            <select
                                id="pricing"
                                name="pricing"
                                required
                                className="filter-select"
                                style={{ width: "100%", padding: "10px 12px", fontSize: "14px" }}
                            >
                                <option value="">Select pricing model</option>
                                <option value="Free">Free</option>
                                <option value="Freemium">Freemium</option>
                                <option value="Paid">Paid</option>
                                <option value="Free-Trial">Free Trial</option>
                                <option value="Contact">Contact for Pricing</option>
                            </select>
                        </div>
                        <FormField label="Your Email" name="email" type="email" required placeholder="you@example.com" />

                        <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px" }}>
                            Submit Tool
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "20px" }}>
                    Submissions are reviewed within 48 hours.
                </p>
            </div>
        </div>
    );
}

function FormField({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
}: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div>
            <label
                htmlFor={name}
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}
            >
                {label}
                {required && <span style={{ color: "var(--badge-paid)", marginLeft: "4px" }}>*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                autoComplete="off"
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontFamily: "inherit",
                    outline: "none",
                    transition: "border-color var(--transition)",
                }}
            />
        </div>
    );
}
