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
        <div className="form-page-container">
            {/* Page header */}
            <div className="form-page-header">
                <span className="form-page-eyebrow">AI tool library</span>
                <h1 className="form-page-title">
                    Submit your <span className="form-page-title-accent">AI&nbsp;tool</span>
                </h1>
                <p className="form-page-subtitle">
                    Get it listed in the library. Free, reviewed within 48 hours.
                </p>
            </div>

            {/* Status banners */}
            {isSubmitted && (
                <p className="form-status form-status-success">
                    Submission received. We&apos;ll review it within 48 hours.
                </p>
            )}
            {hasError && (
                <p className="form-status form-status-error">
                    Couldn&apos;t submit right now. Please verify the fields and try again.
                </p>
            )}

            {/* Double-bordered form card */}
            <div className="inspired-form-card">
                <form className="inspired-form-inner" action="/api/tool-submissions" method="POST">

                    {/* GROUP: identity */}
                    <div className="inspired-group">
                        <p className="inspired-group-label">identity</p>

                        <div className="inspired-field">
                            <label htmlFor="name" className="inspired-label">
                                Tool name<span className="inspired-req">*</span>
                            </label>
                            <div className="inspired-input-wrap">
                                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
                                <input type="text" id="name" name="name" placeholder="ChatGPT" required autoComplete="off" className="inspired-input" />
                            </div>
                        </div>

                        <div className="inspired-field">
                            <label htmlFor="url" className="inspired-label">
                                Official URL<span className="inspired-req">*</span>
                            </label>
                            <div className="inspired-input-wrap">
                                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                                <input type="url" id="url" name="url" placeholder="https://example.com" required autoComplete="off" className="inspired-input" />
                            </div>
                        </div>
                    </div>

                    {/* GROUP: contact */}
                    <div className="inspired-group">
                        <p className="inspired-group-label">contact</p>

                        <div className="inspired-two-col">
                            <div className="inspired-field">
                                <label htmlFor="submitted_by" className="inspired-label">
                                    Submitted by<span className="inspired-req">*</span>
                                </label>
                                <div className="inspired-input-wrap">
                                    <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/></svg>
                                    <input type="text" id="submitted_by" name="submitted_by" placeholder="Your full name" required autoComplete="off" className="inspired-input" />
                                </div>
                            </div>

                            <div className="inspired-field">
                                <label htmlFor="email" className="inspired-label">
                                    Your email<span className="inspired-req">*</span>
                                </label>
                                <div className="inspired-input-wrap">
                                    <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                                    <input type="email" id="email" name="email" placeholder="you@example.com" required autoComplete="off" className="inspired-input" />
                                </div>
                            </div>
                        </div>

                        <div className="inspired-field">
                            <label htmlFor="relationship_to_company" className="inspired-label">
                                Your relationship to the tool<span className="inspired-req">*</span>
                            </label>
                            <div className="inspired-select-wrap">
                                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                                <svg className="inspired-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                <select id="relationship_to_company" name="relationship_to_company" required defaultValue="" className="inspired-select">
                                    <option value="" disabled>Select relationship</option>
                                    <option value="founder">Founder / Creator</option>
                                    <option value="employee">Employee / Team Member</option>
                                    <option value="marketer">Marketing / PR Agency</option>
                                    <option value="fan">Fan / User</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* GROUP: listing details */}
                    <div className="inspired-group">
                        <p className="inspired-group-label">listing details</p>

                        <div className="inspired-field">
                            <label htmlFor="description" className="inspired-label">
                                Tool description <span className="inspired-opt">optional</span>
                            </label>
                            <textarea id="description" name="description" rows={3} placeholder="A short description of what the tool does..." className="inspired-textarea" />
                        </div>

                        <div className="inspired-field">
                            <label htmlFor="note" className="inspired-label">
                                Notes for admins <span className="inspired-opt">optional</span>
                            </label>
                            <textarea id="note" name="note" rows={3} placeholder="Any promo codes, special features, or listing requests..." className="inspired-textarea" />
                        </div>

                        <div className="inspired-field">
                            <label htmlFor="company_contact" className="inspired-label">
                                Company contact <span className="inspired-opt">optional</span>
                            </label>
                            <div className="inspired-input-wrap">
                                <svg className="inspired-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M8 10h8M8 14h5"/></svg>
                                <input type="text" id="company_contact" name="company_contact" placeholder="Alternative email, Twitter handle, or phone" autoComplete="off" className="inspired-input" />
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <button type="submit" className="btn-tag-style btn-primary-tag inspired-submit-btn">
                        <span className="btn-tag-icon-box">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                        </span>
                        <span>Submit Tool</span>
                    </button>

                    <p className="inspired-fineprint">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Submissions are reviewed within 48 hours
                    </p>
                </form>
            </div>
        </div>
    );
}
