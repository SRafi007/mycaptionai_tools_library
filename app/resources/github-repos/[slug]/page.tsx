import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, GitFork, Eye, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import { Github } from "@/components/icons/github";
import { getRepoBySlug, getAllRepoSlugs, getRelatedRepos } from "@/lib/db/resources";
import Breadcrumbs from "@/components/breadcrumbs";
import BackToTop from "@/components/back-to-top";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH, localCanonicalUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllRepoSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface RepoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepoBySlug(slug);

  if (!repo) {
    return { title: "Repository Not Found" };
  }

  const title = repo.seo_title || `${repo.owner}/${repo.repo_name} | Trending GitHub AI Repo | ${SITE_NAME}`;
  const description = repo.seo_description || repo.description || `Explore ${repo.owner}/${repo.repo_name} open-source AI project. Stars: ${repo.stars_count.toLocaleString()}, Language: ${repo.primary_language || "N/A"}.`;
  const canonical = localCanonicalUrl(repo.homepage_url || "", `/resources/github-repos/${repo.slug}`);
  const socialImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

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
      images: [{ url: socialImage, alt: `${repo.owner}/${repo.repo_name} on ${SITE_NAME}` }],
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

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return `${stars}`;
}

export default async function RepoDetailPage({ params }: RepoPageProps) {
  const { slug } = await params;
  const repo = await getRepoBySlug(slug);

  if (!repo) {
    notFound();
  }

  const relatedRepos = await getRelatedRepos(repo.slug, repo.primary_language || null, 3);
  const canonical = localCanonicalUrl(repo.homepage_url || "", `/resources/github-repos/${repo.slug}`);

  const codeSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: repo.repo_name,
    description: repo.description || repo.repo_name,
    codeRepository: repo.html_url,
    programmingLanguage: repo.primary_language || "English",
    runtimePlatform: "Web",
    license: repo.license_name || "",
    keywords: repo.topics?.join(", ") || "",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(codeSchema) }}
      />
      <div className="container-main resource-detail-container">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/resources" },
            { label: "GitHub Repos", href: "/resources/github-repos" },
            { label: `${repo.owner}/${repo.repo_name}` },
          ]}
          currentPath={`/resources/github-repos/${repo.slug}`}
        />

        <div className="resource-detail-header">
          <Link href="/resources/github-repos" className="back-link">
            <ArrowLeft size={13} /> Back to Repository Index
          </Link>

          <h1 className="resource-detail-title">{repo.owner}/{repo.repo_name}</h1>

          <div className="resource-meta-row">
            {repo.primary_language && (
              <span className="prompt-card-tag">{repo.primary_language}</span>
            )}
            {repo.license_name && (
              <span className="prompt-card-tag">{repo.license_name}</span>
            )}
            <span className="prompt-card-tag">
              ★ {repo.stars_count.toLocaleString()} stars
            </span>
          </div>
        </div>

        <div className="resource-detail-grid">
          {/* Main Content Column */}
          <div className="resource-main-content">
            <div className="news-body-section">
              <p style={{ fontSize: "1.2rem", fontWeight: "500", lineHeight: "1.6" }}>
                {repo.description || "No description provided for this repository."}
              </p>
            </div>

            <div className="resource-action-row">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tag-style btn-primary-tag btn-sm"
              >
                <span className="btn-tag-icon-box">
                  <Github size={10} />
                </span>
                <span>View on GitHub</span>
              </a>

              {repo.homepage_url && (
                <a
                  href={repo.homepage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tag-style btn-secondary-tag btn-sm"
                >
                  <span>Visit Website &rarr;</span>
                </a>
              )}
            </div>

            {repo.topics && repo.topics.length > 0 && (
              <div className="prompt-detail-tags-new" style={{ marginTop: "1rem" }}>
                {repo.topics.map((topic) => (
                  <span key={topic} className="prompt-pill-tag">
                    #{topic}
                  </span>
                ))}
                {(repo.category_tags || []).map((cat) => (
                  <span key={cat} className="prompt-pill-tag" style={{ opacity: 0.8 }}>
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="resource-sidebar">
            <div className="repo-info-card">
              <h3 className="repo-info-title">Repository Info</h3>
              <div className="repo-info-list">
                <div className="repo-info-item">
                  <span className="repo-info-label">Stars</span>
                  <span className="repo-info-value">★ {repo.stars_count.toLocaleString()}</span>
                </div>
                <div className="repo-info-item">
                  <span className="repo-info-label">Forks</span>
                  <span className="repo-info-value">{repo.forks_count.toLocaleString()}</span>
                </div>
                <div className="repo-info-item">
                  <span className="repo-info-label">Watchers</span>
                  <span className="repo-info-value">{repo.watchers_count.toLocaleString()}</span>
                </div>
                <div className="repo-info-item">
                  <span className="repo-info-label">Open Issues</span>
                  <span className="repo-info-value">{repo.open_issues_count.toLocaleString()}</span>
                </div>
                {repo.license_name && (
                  <div className="repo-info-item">
                    <span className="repo-info-label">License</span>
                    <span className="repo-info-value">{repo.license_name}</span>
                  </div>
                )}
                <div className="repo-info-item">
                  <span className="repo-info-label">Last Pushed</span>
                  <span className="repo-info-value">{formatRelativeTime(repo.pushed_at_github)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Repos Section */}
        {relatedRepos.length > 0 && (
          <section className="related-section">
            <div className="related-header">
              <h2 className="related-title">Related AI Projects</h2>
              <Link href="/resources/github-repos" className="pulse-view-all-link">
                View all &rarr;
              </Link>
            </div>
            <div className="related-grid">
              {relatedRepos.map((r) => (
                <div key={r.id} className="repo-card-item card" style={{ height: "100%", justifyContent: "space-between" }}>
                  <div>
                    <div className="repo-card-head" style={{ marginBottom: "12px" }}>
                      <h4 className="repo-card-name" style={{ fontSize: "14px", maxWidth: "100%" }}>
                        <Link href={`/resources/github-repos/${r.slug}`}>
                          {r.owner}/{r.repo_name}
                        </Link>
                      </h4>
                    </div>
                    <p className="repo-card-desc" style={{ fontSize: "12px", height: "auto", minHeight: "36px" }}>
                      {r.description || "No description provided."}
                    </p>
                  </div>
                  <div className="repo-card-footer" style={{ marginTop: "16px", paddingTop: "12px" }}>
                    <div className="repo-stats-row">
                      <span className="prompt-card-tag" title="Stars">
                        ★ {formatStars(r.stars_count)}
                      </span>
                      {r.primary_language && (
                        <span className="prompt-card-tag">
                          {r.primary_language}
                        </span>
                      )}
                    </div>
                    <Link href={`/resources/github-repos/${r.slug}`} className="repo-visit-link">
                      Details &rarr;
                    </Link>
                  </div>
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
