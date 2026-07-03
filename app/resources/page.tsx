import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper, Compass, Library, BookOpen, Star, GitFork } from "lucide-react";
import { Github } from "@/components/icons/github";
import { getHomepageNews, getHomepageRepos } from "@/lib/db/resources";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Resource Hub: News & Open-source Repos | MyCaptionAI",
  description: "Explore the latest AI news, trending open-source AI projects on GitHub, AI tools directory, and prompt libraries.",
  alternates: {
    canonical: absoluteUrl("/resources"),
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

export default async function ResourcesHubPage() {
  const [news, repos] = await Promise.all([
    getHomepageNews(),
    getHomepageRepos(),
  ]);

  const hubNavCards = [
    {
      title: "AI News",
      desc: "Stay updated with official announcements and latest releases.",
      href: "/resources/ai-news",
      icon: <Newspaper className="hub-nav-icon text-[#38bdf8]" size={20} />,
      badge: "News",
      borderColor: "rgba(56, 189, 248, 0.2)",
    },
    {
      title: "Trending GitHub Repos",
      desc: "Explore top trending open-source AI libraries and MCP servers.",
      href: "/resources/github-repos",
      icon: <Github className="hub-nav-icon text-[#a855f7]" size={20} />,
      badge: "GitHub",
      borderColor: "rgba(168, 85, 247, 0.2)",
    },
    {
      title: "AI Tools Directory",
      desc: "Browse and search thousands of curated AI applications.",
      href: "/ai-tools",
      icon: <Compass className="hub-nav-icon text-[#10b981]" size={20} />,
      badge: "Tools",
      borderColor: "rgba(16, 185, 129, 0.2)",
    },
    {
      title: "Prompt Library",
      desc: "Copy production-ready prompts for ChatGPT, Claude, and Midjourney.",
      href: "/prompts",
      icon: <Library className="hub-nav-icon text-[#f59e0b]" size={20} />,
      badge: "Prompts",
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    {
      title: "Playbooks",
      desc: "Step-by-step guides to integrate AI into your daily workflows.",
      href: "/playbooks",
      icon: <BookOpen className="hub-nav-icon text-[#ec4899]" size={20} />,
      badge: "Guides",
      borderColor: "rgba(236, 72, 153, 0.2)",
    },
  ];

  return (
    <main className="resources-hub-page-wrapper">
      {/* Hero Section */}
      <section className="hub-hero-section dot-grid">
        <div className="container-main">
          <div className="hub-hero-content">
            <span className="hub-hero-pill">freshness layer</span>
            <h1 className="hub-hero-title">AI Resource Hub</h1>
            <p className="hub-hero-desc">
              Latest AI news, trending open-source projects, and useful resources for builders.
            </p>
          </div>
        </div>
      </section>

      {/* Grid of Hub Sections */}
      <section className="hub-nav-section">
        <div className="container-main">
          <div className="hub-nav-grid">
            {hubNavCards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                className="card hub-nav-card"
                style={{ borderColor: card.borderColor }}
              >
                <div className="hub-card-top">
                  <span className="hub-card-icon-wrapper">{card.icon}</span>
                  <span className="hub-card-badge-tag">{card.badge}</span>
                </div>
                <h3 className="hub-card-title">{card.title}</h3>
                <p className="hub-card-desc">{card.desc}</p>
                <div className="hub-card-footer">
                  <span className="hub-card-explore-text">Explore</span>
                  <ArrowRight size={14} className="hub-card-arrow" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Previews Section */}
      <section className="hub-previews-section section-padding">
        <div className="container-main">
          <div className="resource-hub-grid">
            {/* Left preview: News */}
            <div className="resource-hub-col news-column">
              <h2 className="column-title">
                <span className="column-title-icon">📰</span>
                Latest News Preview
              </h2>
              <div className="news-list">
                {news.map((item) => (
                  <div key={item.id} className="news-list-item card">
                    <div className="news-item-meta">
                      <span className="prompt-card-tag">{item.source_name}</span>
                      <span className="prompt-card-tag">{formatRelativeTime(item.published_at)}</span>
                    </div>
                    <h4 className="news-item-title">
                      <Link href={`/resources/ai-news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h4>
                    {item.excerpt && (
                      <p className="news-item-excerpt">{item.excerpt}</p>
                    )}
                    <a
                      href={item.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-read-link"
                    >
                      Read source &rarr;
                    </a>
                  </div>
                ))}
              </div>
              <div className="column-footer">
                <Link href="/resources/ai-news" className="column-cta-link">
                  View all AI news &rarr;
                </Link>
              </div>
            </div>

            {/* Right preview: GitHub Repos */}
            <div className="resource-hub-col repos-column">
              <h2 className="column-title">
                <span className="column-title-icon"><Github size={18} className="text-[#a855f7]" style={{ display: "inline" }} /></span>
                Trending Repos Preview
              </h2>
              <div className="repos-grid">
                {repos.map((repo) => (
                  <div key={repo.id} className="repo-card-item card">
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
                      {(repo.category_tags || []).slice(0, 3).map((tag) => (
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
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="repo-visit-link"
                      >
                        GitHub &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="column-footer">
                <Link href="/resources/github-repos" className="column-cta-link">
                  Explore GitHub repos &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
