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

interface PageProps {
    searchParams: Promise<{ submitted?: string; error?: string }>;
}

export default async function SubmitPage({ searchParams }: PageProps) {
    const { submitted, error } = await searchParams;
    const isSubmitted = submitted === "1";
    const hasError = error === "invalid" || error === "save";

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

                {isSubmitted && (
                    <p
                        style={{
                            margin: "0 auto 20px",
                            maxWidth: "480px",
                            padding: "12px 14px",
                            fontSize: "13px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(31, 164, 107, 0.35)",
                            background: "rgba(31, 164, 107, 0.12)",
                            color: "var(--text-primary)",
                            textAlign: "center",
                        }}
                    >
                        Submission received. We&apos;ll review it within 48 hours.
                    </p>
                )}

                {hasError && (
                    <p
                        style={{
                            margin: "0 auto 20px",
                            maxWidth: "480px",
                            padding: "12px 14px",
                            fontSize: "13px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid rgba(209, 89, 89, 0.35)",
                            background: "rgba(209, 89, 89, 0.12)",
                            color: "var(--text-primary)",
                            textAlign: "center",
                        }}
                    >
                        Couldn&apos;t submit right now. Please verify the fields and try again.
                    </p>
                )}

                <form
                    className="card"
                    style={{ padding: "32px" }}
                    action="/api/tool-submissions"
                    method="POST"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <FormField label="Tool Name" name="name" required placeholder="e.g. ChatGPT" />
                        <FormField label="Official URL" name="url" type="url" required placeholder="https://..." />
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
