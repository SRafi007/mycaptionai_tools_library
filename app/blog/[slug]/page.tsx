import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/db/blog";
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

// Simple Markdown-to-HTML (no external dependency)
function renderMarkdown(md: string): string {
    let html = md;

    // Headers
    html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gm, "<h2>$1</h2>"); // H1 → H2 since page has H1

    // Bold / Italic
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Blockquotes
    html = html.replace(/^> (.*$)/gm, "<blockquote><p>$1</p></blockquote>");

    // Unordered lists
    html = html.replace(/^\- (.*$)/gm, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

    // Paragraphs (double newlines)
    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html}</p>`;

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, "");
    html = html.replace(/<p>\s*<(h[23]|ul|ol|blockquote)/g, "<$1");
    html = html.replace(/<\/(h[23]|ul|ol|blockquote)>\s*<\/p>/g, "</$1>");

    return html;
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
                    {/* Header */}
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

                    {/* Cover Image */}
                    {post.cover_image_url && (
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            style={{ width: "100%", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", marginBottom: "32px" }}
                            loading="lazy"
                        />
                    )}

                    {/* Content (rendered Markdown) */}
                    <div
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
                    />
                </article>
            </div>

            <BackToTop />
        </>
    );
}
