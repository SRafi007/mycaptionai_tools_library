import Link from "next/link";
import { Star, GitFork, BookOpen } from "lucide-react";
import { Github } from "@/components/icons/github";
import { AiNews, GithubRepo } from "@/types/resources";

interface HomeResourceHubProps {
  news: AiNews[];
  repos: GithubRepo[];
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

export default function HomeResourceHub({ news, repos }: HomeResourceHubProps) {
  // Homepage logic: show 4 items on desktop, 3 on mobile
  const displayNews = news.slice(0, 4);
  const displayRepos = repos.slice(0, 4);

  return (
    <section className="section-padding resource-hub-section">
      <div className="container-main">
        {/* Section Header */}
        <div className="section-header resource-hub-header">
          <div>
            <h2 className="section-title">AI Resource Hub</h2>
            <p className="section-subtitle">
              Stay updated with official AI news and trending open-source AI projects.
            </p>
          </div>
          <Link href="/resources" className="btn-ghost">
            View all resources &rarr;
          </Link>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="resource-hub-grid">
          {/* Left Column: Latest AI News */}
          <div className="resource-hub-col news-column">
            <h3 className="column-title">
              <span className="column-title-icon">📰</span>
              Latest AI News
            </h3>
            <div className="news-list">
              {displayNews.map((item) => (
                <div key={item.id} className="news-list-item">
                  <div className="news-item-meta">
                    <span className="news-source-badge">
                      {item.source_name}
                    </span>
                    <span className="news-time">{formatRelativeTime(item.published_at)}</span>
                  </div>
                  <h4 className="news-item-title">
                    <a href={item.original_url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
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

          {/* Right Column: Trending GitHub AI Repos */}
          <div className="resource-hub-col repos-column">
            <h3 className="column-title">
              <span className="column-title-icon"><Github size={18} className="text-[#a855f7]" style={{ display: "inline" }} /></span>
              Trending GitHub AI Repos
            </h3>
            <div className="repos-grid">
              {displayRepos.map((repo) => (
                <div key={repo.id} className="repo-card-item card">
                  <div className="repo-card-head">
                    <span className="repo-icon-box">
                      <BookOpen size={13} className="text-[#a855f7]" />
                    </span>
                    <h4 className="repo-card-name">
                      <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                        {repo.owner}/{repo.repo_name}
                      </a>
                    </h4>
                  </div>
                  
                  <p className="repo-card-desc">{repo.description || "No description provided."}</p>

                  <div className="repo-card-topics">
                    {(repo.category_tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="repo-topic-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="repo-card-footer">
                    <div className="repo-stats-row">
                      <span className="repo-stat-item" title="Stars">
                        <span className="star-dot">★</span>
                        {formatStars(repo.stars_count)}
                      </span>
                      <span className="repo-stat-item" title="Forks">
                        <GitFork size={11} className="text-muted mr-1" />
                        {formatStars(repo.forks_count)}
                      </span>
                      {repo.primary_language && (
                        <span className="repo-lang-badge">
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
  );
}
