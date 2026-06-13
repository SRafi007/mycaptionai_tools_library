import { Metadata } from "next";
import Link from "next/link";
import { getPromptsPaginated, getPromptTypeCounts } from "@/lib/db/prompts";
import PromptCard from "@/components/prompt-card";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import { PromptType } from "@/types/prompt";

export const revalidate = 60;

export const metadata: Metadata = {
    title: "AI Prompt Library - Find the Best Prompts",
    description: "Discover, copy, and use the best AI prompts for ChatGPT, Midjourney, Claude, and more. Filter by use case and format.",
    alternates: {
        canonical: absoluteUrl("/prompts"),
    },
    openGraph: {
        title: "AI Prompt Library - Find the Best Prompts",
        description: "Discover, copy, and use the best AI prompts for ChatGPT, Midjourney, Claude, and more.",
        url: absoluteUrl("/prompts"),
        images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    },
};

const promptTypeIcons: Record<string, string> = {
    chat: "💬",
    image: "🎨",
    video: "🎬",
    code: "💻",
    seo: "🔍",
    business: "💼",
    marketing: "📈",
    caption: "📝",
    agent: "🤖",
    workflow: "⚙️",
    other: "✨",
};

interface PromptsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PromptsPage({ searchParams }: PromptsPageProps) {
    const params = await searchParams;
    const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
    const typeFilter = typeof params.type === "string" ? (params.type as PromptType) : "all";
    const perPage = 12;

    const [typesData, { prompts, total }] = await Promise.all([
        getPromptTypeCounts(),
        getPromptsPaginated(page, perPage, typeFilter),
    ]);

    const totalPages = Math.ceil(total / perPage);

    // Calculate total prompts for "All" tab
    const totalPrompts = typesData.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="container-main browse-page">
            <h1 className="page-title">Discover the Best AI Prompts</h1>



            <section className="section-padding section-border-t">
                <div className="sidebar-discovery" style={{ alignItems: "flex-start" }}>
                    {/* Sidebar Nav */}
                    <aside className="sidebar-discovery-nav">
                        <div className="sidebar-nav-header">
                            <h2 className="sidebar-nav-title">Categories</h2>
                        </div>
                        <nav className="sidebar-nav-list">
                            <Link
                                href="/prompts"
                                className={`sidebar-nav-item ${typeFilter === "all" ? "sidebar-nav-item-active" : ""}`}
                            >
                                <span className="sidebar-nav-icon">✨</span>
                                <span className="sidebar-nav-label">All Prompts</span>
                                <span className="sidebar-nav-count">{totalPrompts}</span>
                            </Link>
                            {typesData.map((t) => (
                                <Link
                                    key={t.type}
                                    href={`/prompts?type=${t.type}`}
                                    className={`sidebar-nav-item ${typeFilter === t.type ? "sidebar-nav-item-active" : ""}`}
                                >
                                    <span className="sidebar-nav-icon">{promptTypeIcons[t.type] || "✨"}</span>
                                    <span className="sidebar-nav-label" style={{ textTransform: "capitalize" }}>
                                        {t.type}
                                    </span>
                                    <span className="sidebar-nav-count">{t.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content Grid */}
                    <div className="sidebar-content-area" style={{ flex: 1, minWidth: 0 }}>
                        <div className="sidebar-content-header" style={{ marginBottom: "1.5rem" }}>
                            <div>
                                <h2 className="section-title" style={{ textTransform: "capitalize" }}>
                                    {typeFilter === "all" ? "All" : typeFilter} Prompts
                                </h2>
                                <span className="section-count">{total} results</span>
                            </div>
                        </div>

                        {prompts.length > 0 ? (
                            <>
                                <div className="tools-grid sidebar-tools-grid">
                                    {prompts.map((prompt) => (
                                        <PromptCard key={prompt.id} prompt={prompt} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination-wrapper" style={{ marginTop: "3rem" }}>
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            basePath="/prompts"
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <p className="empty-state-text">No prompts found in this category.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <BackToTop />
        </div>
    );
}
