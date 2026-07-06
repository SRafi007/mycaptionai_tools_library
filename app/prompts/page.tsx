import { Metadata } from "next";
import Link from "next/link";
import { getPromptsPaginated, getPromptTypeCounts } from "@/lib/db/prompts";
import PromptCard from "@/components/prompt-card";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import PageHeader from "@/components/page-header";
import { isPromptType, PromptType } from "@/types/prompt";
import {
  MessageSquare,
  Image,
  Film,
  Code,
  Search,
  Briefcase,
  Megaphone,
  Subtitles,
  Bot,
  Network,
  GraduationCap,
  Sparkles,
  LucideIcon
} from "lucide-react";

export const revalidate = 21600; // Cache for 6 hours

interface PromptsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function formatPromptType(value: string): string {
    return value
        .split("-")
        .join(" ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ searchParams }: PromptsPageProps): Promise<Metadata> {
    const params = await searchParams;
    const rawPage = typeof params.page === "string" ? params.page : undefined;
    const rawType = typeof params.type === "string" ? params.type : undefined;
    const page = rawPage ? parseInt(rawPage, 10) || 1 : 1;
    
    const hasKnownType = isPromptType(rawType);
    const title = hasKnownType
        ? `${formatPromptType(rawType)} AI Prompts`
        : "AI Prompt Library - Find the Best Prompts";
    const description = hasKnownType
        ? `Discover, copy, and use ${formatPromptType(rawType).toLowerCase()} AI prompts for practical workflows.`
        : "Discover, copy, and use the best AI prompts for ChatGPT, Midjourney, Claude, and more. Filter by use case and format.";

    // Determine canonical & indexation rules
    let canonical = absoluteUrl("/prompts");
    let isIndexable = page === 1;

    if (rawType) {
        if (hasKnownType) {
            canonical = absoluteUrl(`/prompts?type=${rawType}`);
        } else {
            isIndexable = false; // invalid type filter
        }
    }

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        robots: isIndexable
            ? { index: true, follow: true }
            : { index: false, follow: true },
    };
}

const promptTypeIcons: Record<string, LucideIcon> = {
    chat: MessageSquare,
    image: Image,
    video: Film,
    code: Code,
    seo: Search,
    business: Briefcase,
    marketing: Megaphone,
    caption: Subtitles,
    agent: Bot,
    workflow: Network,
    education: GraduationCap,
    other: Sparkles,
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
            <PageHeader
                title="Discover the Best AI Prompts"
                subtitle="Discover, copy, and use the best AI prompts for ChatGPT, Midjourney, Claude, and more. Filter by use case and format."
            />



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
                                <Sparkles className="sidebar-nav-icon sidebar-nav-lucide-icon" size={20} aria-hidden="true" />
                                <span className="sidebar-nav-label">All Prompts</span>
                                <span className="sidebar-nav-count">{totalPrompts}</span>
                            </Link>
                            {typesData.map((t) => {
                                const IconComp = promptTypeIcons[t.type] || Sparkles;
                                return (
                                    <Link
                                        key={t.type}
                                        href={`/prompts?type=${t.type}`}
                                        className={`sidebar-nav-item ${typeFilter === t.type ? "sidebar-nav-item-active" : ""}`}
                                    >
                                        <IconComp className="sidebar-nav-icon sidebar-nav-lucide-icon" size={20} aria-hidden="true" />
                                        <span className="sidebar-nav-label">
                                            {t.type === "seo" ? "SEO" : t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                        </span>
                                        <span className="sidebar-nav-count">{t.count}</span>
                                    </Link>
                                );
                            })}
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
                                <div className="prompt-masonry-grid">
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
