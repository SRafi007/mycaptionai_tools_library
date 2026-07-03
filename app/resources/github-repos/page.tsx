import { Metadata } from "next";
import Link from "next/link";
import { Star, GitFork, Calendar, BookOpen, ArrowLeft } from "lucide-react";
import { Github } from "@/components/icons/github";
import { getReposPaginated } from "@/lib/db/resources";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 0; // Dynamic server rendering to respond to query parameters

interface PageProps {
  searchParams: Promise<{
    filter?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Trending open-source AI Projects on GitHub | MyCaptionAI",
  description: "Explore top open-source AI repos, MCP servers, agents, LLMs, and libraries sorted by stars, forks, and trend scores.",
  alternates: {
    canonical: absoluteUrl("/resources/github-repos"),
  },
};

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

export default async function GithubReposListingPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentFilter = searchParams.filter || "all";
  const currentSort = searchParams.sort || "trending";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const perPage = 12;

  const { repos, total } = await getReposPaginated({
    page: currentPage,
    perPage,
    filter: currentFilter,
    sort: currentSort,
  });

  const totalPages = Math.ceil(total / perPage);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "llm", label: "LLM" },
    { key: "rag", label: "RAG" },
    { key: "agents", label: "Agents" },
    { key: "mcp", label: "MCP" },
    { key: "vector-db", label: "Vector DB" },
    { key: "voice-ai", label: "Voice AI" },
    { key: "computer-vision", label: "Computer Vision" },
    { key: "python", label: "Python" },
    { key: "typescript", label: "TypeScript" },
  ];

  const sortTabs = [
    { key: "trending", label: "Trending" },
    { key: "stars", label: "Most Starred" },
    { key: "updated", label: "Recently Updated" },
    { key: "new_this_week", label: "New This Week" },
  ];

  const popularLanguages = [
    { label: "Python", key: "python" },
    { label: "TypeScript", key: "typescript" },
  ];

  const popularCategories = [
    { label: "LLM Tools", key: "llm" },
    { label: "RAG Pipelines", key: "rag" },
    { label: "AI Agents", key: "agents" },
    { label: "MCP Plugins", key: "mcp" },
    { label: "Vector Database", key: "vector-db" },
    { label: "Computer Vision", key: "computer-vision" },
  ];

  return (
    <main className="resources-hub-page-wrapper">
      {/* Hero Header */}
      <section className="listing-hero-section dot-grid">
        <div className="container-main">
          <Link href="/resources" className="back-link">
            <ArrowLeft size={13} /> Back to Hub
          </Link>
          <div className="listing-hero-content">
            <div className="hub-hero-pill">open-source</div>
            <h1 className="listing-title">Trending GitHub AI Repos</h1>
            <p className="listing-desc">
              Discover top open-source AI projects, MCP servers, libraries, and tools.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="listing-content-section section-padding">
        <div className="container-main listing-layout">
          {/* Main Cards Column */}
          <div className="listing-main-col">
            {/* Filter Tabs (Horizontal scroll on mobile) */}
            <div className="filter-tabs-row scrollbar-hidden">
              {filterTabs.map((tab) => {
                const isActive = currentFilter === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={`/resources/github-repos?filter=${tab.key}&sort=${currentSort}`}
                    className={`filter-tab-pill ${isActive ? "filter-tab-active" : ""}`}
                    scroll={false}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            {/* Sort Bar */}
            <div className="sort-bar-row">
              <span className="sort-title">Sort by:</span>
              <div className="sort-options">
                {sortTabs.map((tab) => {
                  const isActive = currentSort === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      href={`/resources/github-repos?filter=${currentFilter}&sort=${tab.key}`}
                      className={`sort-option-item ${isActive ? "sort-option-active" : ""}`}
                      scroll={false}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Repos Grid */}
            {repos.length > 0 ? (
              <div className="repos-listing-grid">
                {repos.map((repo) => (
                  <div key={repo.id} className="repo-card-item card listing-repo-card">
                    <div className="repo-card-head">
                      <span className="repo-icon-box">
                        <BookOpen size={13} className="text-[#a855f7]" />
                      </span>
                      <h4 className="repo-card-name">
                        <Link href={`/resources/github-repos/${repo.slug}`}>
                          {repo.owner}/{repo.repo_name}
                        </Link>
                      </h4>
                    </div>

                    <p className="repo-card-desc">{repo.description || "No description provided."}</p>

                    <div className="repo-card-topics">
                      {(repo.category_tags || []).slice(0, 4).map((tag) => (
                        <span key={tag} className="prompt-card-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="repo-card-footer">
                      <div className="repo-stats-row">
                        <span className="prompt-card-tag" title="Stars">
                          <span className="star-dot">★</span>
                          {formatStars(repo.stars_count)}
                        </span>
                        <span className="prompt-card-tag" title="Forks">
                          <GitFork size={11} className="text-muted" />
                          {formatStars(repo.forks_count)}
                        </span>
                        {repo.primary_language && (
                          <span className="prompt-card-tag">
                            {repo.primary_language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="repo-listing-card-bottom">
                      <span className="repo-updated-time">
                        <Calendar size={11} className="inline mr-1" />
                        Pushed {formatRelativeTime(repo.pushed_at_github)}
                      </span>
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ margin: "40px 0" }}>
                <div className="empty-state-icon">💻</div>
                <p className="empty-state-text">No repositories found matching the filters.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-row">
                <Link
                  href={`/resources/github-repos?filter=${currentFilter}&sort=${currentSort}&page=${currentPage - 1}`}
                  className={`btn-secondary btn-sm ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
                >
                  &larr; Previous
                </Link>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <Link
                  href={`/resources/github-repos?filter=${currentFilter}&sort=${currentSort}&page=${currentPage + 1}`}
                  className={`btn-secondary btn-sm ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
                >
                  Next &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (Desktop only) */}
          <aside className="listing-sidebar-col">
            {/* Languages Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Languages</h3>
              <div className="widget-links">
                {popularLanguages.map((lang) => (
                  <Link
                    key={lang.key}
                    href={`/resources/github-repos?filter=${lang.key}&sort=${currentSort}`}
                    className={`sidebar-link-item ${currentFilter === lang.key ? "sidebar-link-active" : ""}`}
                  >
                    <span className="sidebar-link-dot"></span>
                    {lang.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Categories</h3>
              <div className="widget-links">
                {popularCategories.map((cat) => (
                  <Link
                    key={cat.key}
                    href={`/resources/github-repos?filter=${cat.key}&sort=${currentSort}`}
                    className={`sidebar-link-item ${currentFilter === cat.key ? "sidebar-link-active" : ""}`}
                  >
                    <span className="sidebar-link-dot"></span>
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
