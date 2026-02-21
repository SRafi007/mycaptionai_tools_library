import { Metadata } from "next";
import { getPublishedPosts } from "@/lib/db/blog";
import Pagination from "@/components/pagination";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";

export const metadata: Metadata = {
    title: "AI News & Insights — Blog | MyCaptionAI",
    description: "Stay up-to-date with the latest AI trends, tool reviews, and industry insights. Fresh AI gossips and analysis for creators and developers.",
};

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
    const { page: pageStr } = await searchParams;
    const currentPage = parseInt(pageStr || "1", 10) || 1;
    const PER_PAGE = 12;

    const { posts, total } = await getPublishedPosts(currentPage, PER_PAGE);
    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <div className="container-main">
            <div className="page-header">
                <h1 className="page-title">AI News & Insights</h1>
                <p className="page-subtitle">
                    The latest AI gossips, tool reviews, and industry trends — curated for creators
                    and developers.
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
                                                    fontSize: "32px",
                                                    background: "var(--accent-subtle)",
                                                }}
                                            >
                                                📰
                                            </div>
                                        )}
                                        <div className="blog-card-body">
                                            <h2 className="blog-card-title">{post.title}</h2>
                                            {post.excerpt && (
                                                <p className="blog-card-excerpt">{post.excerpt}</p>
                                            )}
                                            <div className="blog-card-meta">
                                                <span>{post.author}</span>
                                                <span>•</span>
                                                <span>
                                                    {post.published_at
                                                        ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                        : "Draft"}
                                                </span>
                                                {post.tags.length > 0 && (
                                                    <>
                                                        <span>•</span>
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
                        <div className="empty-state-icon">📝</div>
                        <p className="empty-state-text">
                            No blog posts yet. Check back soon for AI news and insights!
                        </p>
                    </div>
                )}
            </div>

            <BackToTop />
        </div>
    );
}
