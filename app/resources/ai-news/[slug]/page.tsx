import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ArrowUpRight, ArrowLeft } from "lucide-react";
import { getNewsBySlug, getAllNewsSlugs, getRelatedNews } from "@/lib/db/resources";
import Breadcrumbs from "@/components/breadcrumbs";
import BackToTop from "@/components/back-to-top";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH, localCanonicalUrl } from "@/lib/seo";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    return { title: "Article Not Found" };
  }

  const title = item.seo_title || `${item.title} | AI News | ${SITE_NAME}`;
  const description = item.seo_description || item.excerpt || `Read official AI update: "${item.title}" from ${item.source_name}. Stay updated on AI industry news.`;
  const canonical = localCanonicalUrl(item.canonical_url || "", `/resources/ai-news/${item.slug}`);
  const socialImage = item.image_url || absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: socialImage, alt: `${item.title} news cover on ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "recently";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${Math.max(1, diffMins)}m ago`;
  }
  if (diffHrs < 24) {
    return `${diffHrs}h ago`;
  }
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default async function NewsDetailPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const relatedArticles = await getRelatedNews(item.slug, item.source_name, 3);
  const canonical = localCanonicalUrl(item.canonical_url || "", `/resources/ai-news/${item.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: item.excerpt || item.title,
    image: item.image_url ? [item.image_url] : [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
    datePublished: item.published_at,
    author: {
      "@type": "Person",
      name: item.author || item.source_name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
  };

  const hasGeneratedContent = Boolean(item.generated_content && item.generated_content.trim());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="container-main resource-detail-container">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "AI News", href: "/resources/ai-news" },
            { label: item.title },
          ]}
          currentPath={`/resources/ai-news/${item.slug}`}
        />

        <div className="resource-detail-header">
          <Link href="/resources/ai-news" className="back-link">
            <ArrowLeft size={13} /> Back to News Feed
          </Link>

          {!hasGeneratedContent && (
            <h1 className="resource-detail-title">{item.title}</h1>
          )}

          <div className="resource-meta-row">
            <span className="prompt-card-tag">{item.source_name}</span>
            <span className="prompt-card-tag">
              <Calendar size={11} className="inline mr-1" />
              {formatRelativeTime(item.published_at)}
            </span>
            {item.author && (
              <span className="prompt-card-tag">
                <User size={11} className="inline mr-1" />
                {item.author}
              </span>
            )}
          </div>
        </div>

        <div className="resource-detail-grid">
          {/* Main Content Column */}
          <div className="resource-main-content">
            {item.image_url && (
              <div className="news-image-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.title} />
              </div>
            )}

            {!hasGeneratedContent && item.why_it_matters && (
              <div className="news-why-matters">
                <h3 className="why-matters-title">Why It Matters</h3>
                <p className="why-matters-content">{item.why_it_matters}</p>
              </div>
            )}

            {hasGeneratedContent ? (
              <div
                className="news-body-section news-generated-content"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(item.generated_content || "") }}
              />
            ) : (
              <div className="news-body-section">
                <p>{item.summary || item.excerpt || "No summary details available."}</p>
              </div>
            )}

            <div className="resource-action-row">
              <a
                href={item.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tag-style btn-primary-tag btn-sm"
              >
                <span className="btn-tag-icon-box">
                  <ArrowUpRight size={10} />
                </span>
                <span>Read Original Source</span>
              </a>
            </div>

            {(item.topic_tags || item.company_tags) && (
              <div className="prompt-detail-tags-new" style={{ marginTop: "1rem" }}>
                {(item.topic_tags || []).map((tag) => (
                  <span key={tag} className="prompt-pill-tag">
                    #{tag}
                  </span>
                ))}
                {(item.company_tags || []).map((tag) => (
                  <span key={tag} className="prompt-pill-tag" style={{ opacity: 0.8 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="resource-sidebar">
            {/* Optional Sidebar Widgets can go here */}
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="related-section">
            <div className="related-header">
              <h2 className="related-title">Related AI News</h2>
              <Link href="/resources/ai-news" className="pulse-view-all-link">
                View all &rarr;
              </Link>
            </div>
            <div className="related-grid">
              {relatedArticles.map((article) => (
                <div key={article.id} className="news-list-item card" style={{ height: "100%", justifyContent: "space-between" }}>
                  <div>
                    <div className="news-item-meta" style={{ marginBottom: "12px" }}>
                      <span className="prompt-card-tag">{article.source_name}</span>
                      <span className="prompt-card-tag">{formatRelativeTime(article.published_at)}</span>
                    </div>
                    <h4 className="news-item-title" style={{ fontSize: "14px" }}>
                      <Link href={`/resources/ai-news/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h4>
                  </div>
                  <Link href={`/resources/ai-news/${article.slug}`} className="news-read-link" style={{ marginTop: "16px" }}>
                    Read details &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BackToTop />
    </>
  );
}
