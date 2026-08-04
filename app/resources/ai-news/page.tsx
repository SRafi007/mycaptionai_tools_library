import { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Calendar, ArrowUpRight } from "lucide-react";
import { getNewsPaginated } from "@/lib/db/resources";
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
  title: "Latest AI News & Official Updates | MyCaptionAI",
  description: "Browse AI industry news, product releases, and updates from OpenAI, Anthropic, Google, NVIDIA, and Hugging Face.",
  alternates: {
    canonical: absoluteUrl("/resources/ai-news"),
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

export default async function NewsListingPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentFilter = searchParams.filter || "all";
  const currentSort = searchParams.sort || "latest";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const perPage = 12;

  const { news, total } = await getNewsPaginated({
    page: currentPage,
    perPage,
    filter: currentFilter,
    sort: currentSort,
  });

  const totalPages = Math.ceil(total / perPage);

  const filterTabs = [
    { key: "all", label: "All" },
    { key: "official", label: "Official Updates" },
    { key: "openai", label: "OpenAI" },
    { key: "google", label: "Google" },
    { key: "microsoft", label: "Microsoft" },
    { key: "nvidia", label: "NVIDIA" },
    { key: "hugging-face", label: "Hugging Face" },
    { key: "models", label: "Models" },
    { key: "agents", label: "Agents" },
    { key: "rag", label: "RAG" },
    { key: "developer", label: "Developer Tools" },
  ];

  const sortTabs = [
    { key: "latest", label: "Latest" },
    { key: "top_today", label: "Top Today" },
    { key: "official", label: "Official Updates" },
    { key: "popular", label: "Most Popular" },
  ];

  const popularSources = [
    { label: "OpenAI", key: "openai" },
    { label: "Google Gemini", key: "google" },
    { label: "Microsoft", key: "microsoft" },
    { label: "NVIDIA", key: "nvidia" },
    { label: "Hugging Face", key: "hugging-face" },
  ];

  const trendingTopics = [
    { label: "Large Language Models", key: "models" },
    { label: "AI Agents", key: "agents" },
    { label: "Retrieval-Augmented Gen", key: "rag" },
    { label: "Developer SDKs & Tools", key: "developer" },
  ];

  return (
    <main className="resources-hub-page-wrapper">
      {/* Hero Header */}
      <section className="listing-hero-section dot-grid">
        <div className="container-main">
          <div className="listing-hero-content">
            <div className="hub-hero-pill">news feed</div>
            <h1 className="listing-title">Latest AI News</h1>
            <p className="listing-desc">
              Curated official updates and announcements from leading AI companies and research teams.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="listing-content-section section-padding">
        <div className="container-main listing-layout">
          {/* Main List Column */}
          <div className="listing-main-col">
            {/* Filter Tabs (Horizontal scroll on mobile) */}
            <div className="filter-tabs-row scrollbar-hidden">
              {filterTabs.map((tab) => {
                const isActive = currentFilter === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={`/resources/ai-news?filter=${tab.key}&sort=${currentSort}`}
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
                      href={`/resources/ai-news?filter=${currentFilter}&sort=${tab.key}`}
                      className={`sort-option-item ${isActive ? "sort-option-active" : ""}`}
                      scroll={false}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* News List */}
            {news.length > 0 ? (
              <div className="news-list-container">
                {news.map((item) => (
                  <div key={item.id} className="news-listing-card card">
                    <div className="news-card-header">
                      <div className="news-card-badges-row">
                        <span className="prompt-card-tag">{item.source_name}</span>
                        {(item.topic_tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="prompt-card-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="news-card-date">
                        <Calendar size={12} className="inline mr-1" />
                        {formatRelativeTime(item.published_at)}
                      </span>
                    </div>

                    <h2 className="news-card-title">
                      <Link href={`/resources/ai-news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h2>

                    {item.excerpt && <p className="news-card-summary">{item.excerpt}</p>}

                    <div className="news-card-footer">
                      {item.author && (
                        <span className="news-card-author">By {item.author}</span>
                      )}
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tag-style btn-primary-tag btn-sm"
                      >
                        <span className="btn-tag-icon-box">
                          <ArrowUpRight size={10} />
                        </span>
                        <span>Read Source</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ margin: "40px 0" }}>
                <div className="empty-state-icon">📰</div>
                <p className="empty-state-text">No articles found matching the filters.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-row">
                <Link
                  href={`/resources/ai-news?filter=${currentFilter}&sort=${currentSort}&page=${currentPage - 1}`}
                  className={`btn-secondary btn-sm ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
                >
                  &larr; Previous
                </Link>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <Link
                  href={`/resources/ai-news?filter=${currentFilter}&sort=${currentSort}&page=${currentPage + 1}`}
                  className={`btn-secondary btn-sm ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
                >
                  Next &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Right Sidebar Column (Desktop only) */}
          <aside className="listing-sidebar-col">
            {/* Top Sources widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Top Sources</h3>
              <div className="widget-links">
                {popularSources.map((source) => (
                  <Link
                    key={source.key}
                    href={`/resources/ai-news?filter=${source.key}&sort=${currentSort}`}
                    className={`sidebar-link-item ${currentFilter === source.key ? "sidebar-link-active" : ""}`}
                  >
                    <span className="sidebar-link-dot"></span>
                    {source.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Topics widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Trending Topics</h3>
              <div className="widget-links">
                {trendingTopics.map((topic) => (
                  <Link
                    key={topic.key}
                    href={`/resources/ai-news?filter=${topic.key}&sort=${currentSort}`}
                    className={`sidebar-link-item ${currentFilter === topic.key ? "sidebar-link-active" : ""}`}
                  >
                    <span className="sidebar-link-dot"></span>
                    {topic.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};
