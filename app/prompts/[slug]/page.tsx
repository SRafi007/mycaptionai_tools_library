import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromptBySlug, getAllPromptSlugs, getRelatedPrompts } from "@/lib/db/prompts";
import CopyButton from "@/components/copy-button";
import PromptCard from "@/components/prompt-card";
import Breadcrumbs from "@/components/breadcrumbs";
import BackToTop from "@/components/back-to-top";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
    const slugs = await getAllPromptSlugs();
    return slugs.map((slug) => ({ slug }));
}

interface PromptPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
    const { slug } = await params;
    const prompt = await getPromptBySlug(slug);

    if (!prompt) {
        return { title: "Prompt Not Found" };
    }

    return {
        title: `${prompt.title} - AI Prompt | MyCaptionAI`,
        description: prompt.description || `Use this ${prompt.prompt_type} prompt: ${prompt.title}`,
        alternates: {
            canonical: absoluteUrl(`/prompts/${prompt.slug}`),
        },
        openGraph: {
            title: prompt.title,
            description: prompt.description || "",
            url: absoluteUrl(`/prompts/${prompt.slug}`),
            images: prompt.cover_url ? [prompt.cover_url] : [],
        },
    };
}

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

const difficultyColors: Record<string, string> = {
    beginner: "#16a34a",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
};

export default async function PromptDetailPage({ params }: PromptPageProps) {
    const { slug } = await params;
    const prompt = await getPromptBySlug(slug);

    if (!prompt) {
        notFound();
    }

    const relatedPrompts = await getRelatedPrompts(prompt.slug, prompt.prompt_type, 4);

    // Extract YouTube ID if any
    const getYoutubeVideoId = (url: string | null) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };
    const videoId = getYoutubeVideoId(prompt.youtube_url);
    const hasMedia = !!(prompt.cover_url || videoId);

    // Detect template variables like {{topic}} or [topic] in prompt_body
    const templateVars = prompt.prompt_body.match(/\{\{([^}]+)\}\}|\[([^\]]+)\]/g)?.map(v => v.replace(/[{}[\]]/g, '')) || [];


    // Helper to highlight variables in prompt text
    const renderFormattedPrompt = (text: string) => {
        const regex = /(\{\{[^}]+\}\}|\[[^\]]+\])/g;
        const parts = text.split(regex);
        
        return parts.map((part, index) => {
            const isVariable = (part.startsWith("{{") && part.endsWith("}}")) || (part.startsWith("[") && part.endsWith("]"));
            if (isVariable) {
                return (
                    <span key={index} className="prompt-highlight-variable">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <>
            <div className="container-main prompt-detail-container" style={{ paddingTop: "1.5rem", paddingBottom: "5rem" }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Prompts", href: "/prompts" },
                        { label: prompt.prompt_type, href: `/prompts?type=${prompt.prompt_type}` },
                        { label: prompt.title },
                    ]}
                    currentPath={`/prompts/${prompt.slug}`}
                />

                {/* ── Header Area ── */}
                <header className="prompt-detail-header-new">
                    <h1 className="prompt-detail-title-new">
                        <span className="prompt-title-icon">{promptTypeIcons[prompt.prompt_type] || "✨"}</span>
                        <span>{prompt.title}</span>
                    </h1>

                    {prompt.description && (
                        <p className="prompt-detail-subtitle">{prompt.description}</p>
                    )}

                    {/* Meta Section */}
                    <div className="prompt-detail-meta-new">
                        <span className="prompt-detail-meta-item">👁️ {prompt.view_count.toLocaleString()} views</span>
                        {prompt.tool_tags && prompt.tool_tags.map(tag => (
                            <span key={tag} className="prompt-detail-tool-pill">
                                {tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* ── Showcase Container ── */}
                <section className="prompt-showcase-container">
                    <div className="prompt-showcase-grid">
                        {/* Prompt Code Block (Left Side) */}
                        <div className={`prompt-code-column ${hasMedia ? "" : "prompt-code-column-full"}`}>
                            <div className="prompt-code-header">
                                <span className="prompt-code-badge">PROMPT</span>
                                <CopyButton 
                                    textToCopy={prompt.prompt_body} 
                                    variant="icon" 
                                    label="Copy Prompt" 
                                    className="prompt-code-copy-btn"
                                />
                            </div>
                            <div className="prompt-code-scroll">
                                <pre className="prompt-code-pre">
                                    <code className="prompt-code-text">
                                        {renderFormattedPrompt(prompt.prompt_body)}
                                    </code>
                                </pre>
                            </div>
                        </div>

                        {/* Media Showcase Panel (Right Side) */}
                        {hasMedia && (
                            <div className="prompt-media-column">
                                {videoId ? (
                                    <div className="prompt-media-video-wrapper">
                                        <iframe
                                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                                            title="YouTube video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : prompt.cover_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={prompt.cover_url}
                                        alt={prompt.title}
                                        className="prompt-media-img"
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Information Cards ── */}
                <div className="prompt-info-cards-wrapper">
                    {/* Card 2: Tips for this prompt */}
                    {prompt.tips && Array.isArray(prompt.tips) && prompt.tips.length > 0 && (
                        <div className="prompt-info-card">
                            <h2 className="prompt-info-card-title">Tips for this prompt</h2>
                            <div className="prompt-info-card-list">
                                {(prompt.tips as string[]).map((tip, idx) => (
                                    <div key={idx} className="prompt-info-card-item prompt-bullet-diamond">
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Card 1: What this prompt does */}
                    <div className="prompt-info-card">
                        <h2 className="prompt-info-card-title">What this prompt does</h2>
                        <div className="prompt-info-card-list">
                            {prompt.description && (
                                <div className="prompt-info-card-item prompt-bullet-diamond">
                                    {prompt.description}
                                </div>
                            )}
                            {templateVars.length > 0 && (
                                <div className="prompt-info-card-item prompt-bullet-diamond">
                                    Uses template variables ({templateVars.map(v => `[${v.toUpperCase()}]`).join(", ")}) that you can customize for your specific needs.
                                </div>
                            )}
                            {prompt.tool_tags && prompt.tool_tags.length > 0 && (
                                <div className="prompt-info-card-item prompt-bullet-diamond">
                                    Works best with {prompt.tool_tags.join(", ")}.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                {prompt.tags && prompt.tags.length > 0 && (
                    <div className="prompt-detail-tags-new">
                        {prompt.tags.map(tag => (
                            <Link key={tag} href={`/prompts?type=${prompt.prompt_type}`} className="prompt-pill-tag">
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* ── Related Prompts Section ── */}
                {relatedPrompts.length > 0 && (
                    <section className="prompt-detail-related-new">
                        <div className="prompt-detail-related-header-new">
                            <h2 className="prompt-detail-related-title-new">Related prompts</h2>
                            <Link href={`/prompts?type=${prompt.prompt_type}`} className="prompt-related-view-all">
                                View all →
                            </Link>
                        </div>
                        <div className="prompt-related-grid-new">
                            {relatedPrompts.map((rp) => (
                                <PromptCard key={rp.id} prompt={rp} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <BackToTop />
        </>
    );
}
