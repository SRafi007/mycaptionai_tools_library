"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, GitFork, Star, Newspaper } from "lucide-react";
import { Github } from "@/components/icons/github";
import { AiNews, GithubRepo } from "@/types/resources";
import AINewsFeed from "@/components/ai-news-feed";

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

  // Redesigned news feed uses internal rotation and drag gesture state

  return (
    <section className="section-padding resource-hub-section">
      <div className="container-main">
        {/* Section Header */}
        <header className="resource-hub-header" style={{ marginBottom: "32px" }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              Latest AI News & Trendy Repos
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/resources/ai-news" className="view-all">
              AI News &rarr;
            </Link>
            <Link href="/resources/github-repos" className="view-all">
              Trendy Repos &rarr;
            </Link>
          </div>
        </header>

        {/* 2-Column Desktop Grid */}
        <div className="resource-hub-grid">
          {/* Left Column: Latest AI News (Interactive Stack) */}
          <div className="resource-hub-col news-column">
            <AINewsFeed news={displayNews} />
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
