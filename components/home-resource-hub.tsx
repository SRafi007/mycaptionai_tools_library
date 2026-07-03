"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, GitFork, Star, Newspaper } from "lucide-react";
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

/** Truncate text to a maximum word count */
function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}

// CountUp animated component
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;
          const duration = 1200;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(value * eased));
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  const formatCount = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return n.toString();
  };

  return <span ref={elementRef}>{formatCount(count)}</span>;
}

const getLangColor = (lang: string | null | undefined): string => {
  if (!lang) return "var(--brand)";
  const l = lang.toLowerCase();
  if (l.includes("typescript") || l.includes("javascript") || l === "js" || l === "ts") return "#f1e05a";
  if (l.includes("python") || l === "py") return "#3572A5";
  if (l.includes("go") || l === "golang") return "#00ADD8";
  if (l.includes("rust") || l === "rs") return "#dea584";
  if (l.includes("html") || l.includes("css")) return "#e34c26";
  if (l.includes("c++") || l.includes("cpp")) return "#f34b7d";
  return "var(--brand)";
};

export default function HomeResourceHub({ news, repos }: HomeResourceHubProps) {
  const displayNews = news.slice(0, 3);
  const displayRepos = repos.slice(0, 4);

  // Rotating Stack State
  const [order, setOrder] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (displayNews.length > 0) {
      setOrder(Array.from({ length: displayNews.length }, (_, i) => i));
    }
  }, [news]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isHovered || order.length <= 1) return;
    const interval = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first !== undefined) next.push(first);
        return next;
      });
    }, 3800);
    return () => clearInterval(interval);
  }, [isHovered, order]);

  const posStyles = [
    { transform: "translateY(0px) scale(1)", opacity: 1, zIndex: 3 },
    { transform: "translateY(45px) scale(0.94)", opacity: 0.6, zIndex: 2 },
    { transform: "translateY(90px) scale(0.88)", opacity: 0.32, zIndex: 1 },
  ];

  return (
    <section className="section-padding resource-hub-section">
      <div className="container-main">
        {/* Section Header */}
        <header className="resource-hub-header" style={{ marginBottom: "32px" }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              AI Resource Hub
            </h2>
          </div>
          <Link href="/resources" className="view-all">
            View all resources &rarr;
          </Link>
        </header>

        {/* 2-Column Desktop Grid */}
        <div className="resource-hub-grid">
          {/* Left Column: Latest AI News (Interactive Stack) */}
          <div className="resource-hub-col news-column">
            <div className="section-head">
              <span className="icon">
                <Newspaper size={18} />
              </span>
              <h2>Latest AI News</h2>
              <span className="count">{displayNews.length.toString().padStart(2, "0")}</span>
            </div>

            <div
              className="news-stack"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {displayNews.map((item, idx) => {
                const pos = order.indexOf(idx);
                const isFront = pos === 0;
                const cardStyle =
                  pos < posStyles.length && pos >= 0
                    ? posStyles[pos]
                    : {
                        transform: "translateY(120px) scale(0.8)",
                        opacity: 0,
                        zIndex: 0,
                        pointerEvents: "none" as const,
                      };

                const allTags = [
                  ...(item.topic_tags || []),
                  ...(item.company_tags || []),
                ];

                return (
                  <article
                    key={item.id}
                    className={`news-stack-card ${isFront ? "is-front" : ""}`}
                    style={cardStyle}
                  >
                    <div className="news-title-area">
                      <div className="news-meta">
                        <span className="source-badge">{item.source_name.toUpperCase()}</span>
                        <span className="status-dot"></span>
                        <span className="time-tag">{formatRelativeTime(item.published_at).toUpperCase()}</span>
                      </div>
                      <h3>
                        <Link href={`/resources/ai-news/${item.slug}`}>{item.title}</Link>
                      </h3>
                    </div>
                    <div className="news-body">
                      {item.excerpt && <p>{truncateWords(item.excerpt, 30)}</p>}

                      {allTags.length > 0 && (
                        <div className="prompt-card-tags" style={{ marginBottom: "14px" }}>
                          {allTags.slice(0, 4).map((tag) => (
                            <span key={tag} className="prompt-card-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="read-link"
                      >
                        Read source ↗
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Stack Dots Navigation */}
            {order.length > 0 && (
              <div className="stack-dots">
                {displayNews.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Show news item ${idx + 1}`}
                    className={order[0] === idx ? "active" : ""}
                    onClick={() => {
                      setOrder((prev) => {
                        const pos = prev.indexOf(idx);
                        if (pos <= 0) return prev;
                        return [...prev.slice(pos), ...prev.slice(0, pos)];
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Trending GitHub AI Repos */}
          <div className="resource-hub-col repos-column">
            <div className="section-head">
              <span className="icon">
                <Github size={18} />
              </span>
              <h2>Trending GitHub AI Repos</h2>
              <span className="count">{displayRepos.length.toString().padStart(2, "0")}</span>
            </div>

            <div className="repo-grid">
              {displayRepos.map((repo) => {
                const accentColor = getLangColor(repo.primary_language);
                const cardAccentStyle = {
                  "--card-accent": `${accentColor}33`,
                  "--lang-color": accentColor,
                } as React.CSSProperties;

                const parts = repo.repo_name.split("/");
                const orgName = parts.length > 1 ? parts[0] + " /" : repo.owner + " /";
                const repoOnly = parts.length > 1 ? parts[1] : repo.repo_name;

                return (
                  <article key={repo.id} className="repo-card" style={cardAccentStyle}>
                    <div className="repo-top">
                      <span className="repo-icon">
                        <Github size={16} />
                      </span>
                      <div className="repo-name">
                        <span className="org">{orgName}</span>
                        <br />
                        <Link href={`/resources/github-repos/${repo.slug}`}>{repoOnly}</Link>
                      </div>
                    </div>

                    <p className="repo-desc">{repo.description || "No description provided."}</p>

                    <div className="prompt-card-tags">
                      {(repo.category_tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="prompt-card-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="repo-stats">
                      <span className="stat star">
                        <Star size={12} fill="currentColor" />{" "}
                        <CountUp value={repo.stars_count} />
                      </span>
                      <span className="stat fork">
                        <GitFork size={12} />{" "}
                        <CountUp value={repo.forks_count} />
                      </span>
                      {repo.primary_language && (
                        <>
                          <span className="lang-dot"></span>
                          <span>{repo.primary_language}</span>
                        </>
                      )}
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-tag-style btn-secondary-tag btn-sm repo-github-btn"
                      >
                        <span className="btn-tag-icon-box">
                          <Github size={10} />
                        </span>
                        <span>GitHub</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
