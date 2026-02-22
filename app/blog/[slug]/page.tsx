import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/db/blog";
import type { BlogContentBlock } from "@/lib/db/blog";
import Breadcrumbs from "@/components/breadcrumbs";
import BackToTop from "@/components/back-to-top";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };

    const title = post.seo_title || `${post.title} | MyCaptionAI Blog`;
    const description = post.seo_description || post.excerpt || post.title;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            publishedTime: post.published_at || undefined,
            authors: [post.author],
            images: post.cover_image_url ? [post.cover_image_url] : undefined,
        },
        twitter: { card: "summary_large_image", title, description },
    };
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function sanitizeUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("/")) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return "";
}

function renderInlineMarkdown(input: string): string {
    let html = escapeHtml(input);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text: string, href: string) => {
        const safeHref = sanitizeUrl(href);
        if (!safeHref) return text;
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
    return html;
}

// Safe-enough markdown renderer for legacy content without extra dependencies.
function renderMarkdown(md: string): string {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    const htmlParts: string[] = [];
    let paragraphBuffer: string[] = [];
    let listBuffer: string[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const flushParagraph = () => {
        if (paragraphBuffer.length === 0) return;
        const paragraph = paragraphBuffer.join(" ").trim();
        if (paragraph) htmlParts.push(`<p>${renderInlineMarkdown(paragraph)}</p>`);
        paragraphBuffer = [];
    };

    const flushList = () => {
        if (listBuffer.length === 0) return;
        const listItems = listBuffer.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("");
        htmlParts.push(`<ul>${listItems}</ul>`);
        listBuffer = [];
    };

    const flushCode = () => {
        if (codeBuffer.length === 0) return;
        htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
        codeBuffer = [];
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            flushParagraph();
            flushList();
            if (inCodeBlock) {
                flushCode();
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imageMatch) {
            flushParagraph();
            flushList();
            const alt = escapeHtml(imageMatch[1] || "");
            const src = sanitizeUrl(imageMatch[2] || "");
            if (src) htmlParts.push(`<img src="${src}" alt="${alt}" loading="lazy" />`);
            continue;
        }

        if (trimmed.startsWith("> ")) {
            flushParagraph();
            flushList();
            htmlParts.push(`<blockquote><p>${renderInlineMarkdown(trimmed.slice(2))}</p></blockquote>`);
            continue;
        }

        if (trimmed.startsWith("- ")) {
            flushParagraph();
            listBuffer.push(trimmed.slice(2));
            continue;
        }

        if (trimmed.startsWith("### ")) {
            flushParagraph();
            flushList();
            htmlParts.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
            continue;
        }

        if (trimmed.startsWith("## ")) {
            flushParagraph();
            flushList();
            htmlParts.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
            continue;
        }

        if (trimmed.startsWith("# ")) {
            flushParagraph();
            flushList();
            htmlParts.push(`<h2>${renderInlineMarkdown(trimmed.slice(2))}</h2>`);
            continue;
        }

        flushList();
        paragraphBuffer.push(trimmed);
    }

    flushParagraph();
    flushList();
    if (inCodeBlock) flushCode();

    return htmlParts.join("\n");
}

function renderContentBlocks(blocks: BlogContentBlock[]) {
    if (!Array.isArray(blocks) || blocks.length === 0) return null;

    return blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.type === "heading") {
            return block.level === 3 ? <h3 key={key}>{block.text}</h3> : <h2 key={key}>{block.text}</h2>;
        }

        if (block.type === "paragraph") return <p key={key}>{block.text}</p>;

        if (block.type === "image") {
            const safeSrc = sanitizeUrl(block.src);
            if (!safeSrc) return null;
            return (
                <figure key={key} style={{ margin: "24px 0" }}>
                    <img src={safeSrc} alt={block.alt || ""} loading="lazy" />
                    {block.caption ? (
                        <figcaption style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>
                            {block.caption}
                        </figcaption>
                    ) : null}
                </figure>
            );
        }

        if (block.type === "quote") {
            return (
                <blockquote key={key}>
                    <p>{block.text}</p>
                    {block.cite ? <p style={{ fontSize: "13px" }}>Source: {block.cite}</p> : null}
                </blockquote>
            );
        }

        if (block.type === "list") {
            const items = block.items || [];
            if (items.length === 0) return null;
            if (block.ordered) {
                return (
                    <ol key={key}>
                        {items.map((item, itemIndex) => <li key={`${key}-i-${itemIndex}`}>{item}</li>)}
                    </ol>
                );
            }
            return (
                <ul key={key}>
                    {items.map((item, itemIndex) => <li key={`${key}-i-${itemIndex}`}>{item}</li>)}
                </ul>
            );
        }

        if (block.type === "code") {
            return (
                <pre key={key}>
                    <code>{block.code}</code>
                </pre>
            );
        }

        if (block.type === "cta") {
            const safeHref = block.href ? sanitizeUrl(block.href) : "";
            return (
                <div
                    key={key}
                    style={{
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-lg)",
                        padding: "16px",
                        margin: "20px 0",
                        background: "var(--bg-secondary)",
                    }}
                >
                    <p style={{ fontWeight: 700, margin: "0 0 8px" }}>{block.title}</p>
                    {block.text ? <p style={{ margin: "0 0 10px" }}>{block.text}</p> : null}
                    {safeHref ? (
                        <a href={safeHref} target="_blank" rel="noopener noreferrer">
                            {block.label || "Learn more"}
                        </a>
                    ) : null}
                </div>
            );
        }

        if (block.type === "divider") {
            return <hr key={key} style={{ border: 0, borderTop: "1px solid var(--border-default)", margin: "24px 0" }} />;
        }

        if (block.type === "embed") {
            const safeUrl = sanitizeUrl(block.url);
            if (!safeUrl) return null;
            return (
                <div key={key} style={{ margin: "20px 0" }}>
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer">
                        {block.title || safeUrl}
                    </a>
                </div>
            );
        }

        return null;
    });
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || post.title,
        author: { "@type": "Person", name: post.author },
        datePublished: post.published_at,
        dateModified: post.updated_at,
        image: post.cover_image_url,
        publisher: {
            "@type": "Organization",
            name: "MyCaptionAI",
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container-main">
                <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

                <article className="blog-article" style={{ padding: "24px 0 64px" }}>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.2, margin: "0 0 16px" }}>
                        {post.title}
                    </h1>

                    <div className="blog-card-meta" style={{ marginBottom: "24px" }}>
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>
                            {post.published_at
                                ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                                : "Draft"}
                        </span>
                        {post.tags.map((tag) => (
                            <span key={tag} className="blog-card-tag">{tag}</span>
                        ))}
                    </div>

                    {post.cover_image_url && (
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            style={{ width: "100%", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", marginBottom: "32px" }}
                            loading="lazy"
                        />
                    )}

                    {post.content_format === "blocks"
                        ? <div>{renderContentBlocks(post.content_blocks)}</div>
                        : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />}

                    {post.canonical_source_url ? (
                        <p style={{ marginTop: "32px", color: "var(--text-muted)" }}>
                            Source:{" "}
                            <a href={post.canonical_source_url} target="_blank" rel="noopener noreferrer">
                                {post.canonical_source_url}
                            </a>
                        </p>
                    ) : null}
                </article>
            </div>

            <BackToTop />
        </>
    );
}

