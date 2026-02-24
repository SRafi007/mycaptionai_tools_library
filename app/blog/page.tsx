import { Metadata } from "next";
import { getPublishedPosts } from "@/lib/db/blog";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { page: pageStr } = await searchParams;
    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const isPaginated = currentPage > 1;

    const title = isPaginated
        ? `AI News and Insights - Page ${currentPage}`
        : "AI News and Insights - Blog";
    const description = "Stay up to date with AI trends, tool reviews, and practical insights for creators and teams.";
    const canonical = isPaginated
        ? absoluteUrl(`/blog?page=${currentPage}`)
        : absoluteUrl("/blog");

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            type: "website",
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
        },
        robots: isPaginated ? { index: false, follow: true } : { index: true, follow: true },
    };
}

export default async function BlogPage({ searchParams }: PageProps) {
    const { page: pageStr } = await searchParams;
    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const PER_PAGE = 12;

    const { posts, total } = await getPublishedPosts(currentPage, PER_PAGE);
    const totalPages = Math.ceil(total / PER_PAGE);

    const blogSchema = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${SITE_NAME} Blog`,
        description: "AI trends, tool reviews, and industry insights.",
        url: absoluteUrl("/blog"),
    };

    return (
        <div className="container-main">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
            <div className="page-header">
                <h1 className="page-title">AI News and Insights</h1>
                <p className="page-subtitle">
                    The latest AI trends, tool reviews, and industry analysis for creators and developers.
                </p>
            </div>

            <div className="section-padding">
                {posts.length > 0 ? (
                    <>
                        <div className="blog-grid">
                            {posts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`}>
                                    <article className="blog-card">
                                        {post.cover_image_url && (
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="blog-card-cover"
                                                loading="lazy"
                                            />
                                        )}
                                        {!post.cover_image_url && (
                                            <div
                                                className="blog-card-cover"
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "20px",
                                                    background: "var(--accent-subtle)",
                                                    color: "var(--text-secondary)",
                                                }}
                                            >
                                                Blog
                                            </div>
                                        )}
                                        <div className="blog-card-body">
                                            <h2 className="blog-card-title">{post.title}</h2>
                                            {post.excerpt && (
                                                <p className="blog-card-excerpt">{post.excerpt}</p>
                                            )}
                                            <div className="blog-card-meta">
                                                <span>{post.author}</span>
                                                <span>|</span>
                                                <span>
                                                    {post.published_at
                                                        ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                        : "Draft"}
                                                </span>
                                                {post.tags.length > 0 && (
                                                    <>
                                                        <span>|</span>
                                                        <span className="blog-card-tag">{post.tags[0]}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/blog"
                        />
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">No posts</div>
                        <p className="empty-state-text">
                            No blog posts yet. Check back soon for AI news and insights.
                        </p>
                    </div>
                )}
            </div>

            <BackToTop />
        </div>
    );
}
