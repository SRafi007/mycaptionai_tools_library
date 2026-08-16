import Link from "next/link";
import { ArrowUpRight, Newspaper, Sparkles, Star } from "lucide-react";
import { Github } from "@/components/icons/github";
import { AiNews, GithubRepo } from "@/types/resources";

interface HomePulseStripProps {
  news: AiNews[];
  repos: GithubRepo[];
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "recently";
  try {
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
  } catch {
    return "recently";
  }
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${stars}`;
}

const getLangColor = (lang: string | null | undefined): string => {
  if (!lang) return "#6366f1";
  const l = lang.toLowerCase();
  if (l.includes("typescript") || l.includes("javascript") || l === "js" || l === "ts") return "#f1e05a";
  if (l.includes("python") || l === "py") return "#3572A5";
  if (l.includes("go") || l === "golang") return "#00ADD8";
  if (l.includes("rust") || l === "rs") return "#dea584";
  if (l.includes("html") || l.includes("css")) return "#e34c26";
  if (l.includes("c++") || l.includes("cpp")) return "#f34b7d";
  return "#6366f1";
};

export default function HomePulseStrip({ news, repos }: HomePulseStripProps) {
  // 1. Latest AI News
  const news1 = news[0];
  const news1Title = news1?.title || "New AI model update released";
  const news1Source = news1?.source_name || "Official AI";
  const news1Time = formatRelativeTime(news1?.published_at);
  const news1Excerpt = news1?.excerpt || news1?.summary || "Read the latest breakthrough, architecture release, and engineering update.";
  const news1Tags = (news1?.topic_tags || news1?.company_tags || ["ai", "news"]).slice(0, 2);
  const news1Href = news1 ? `/resources/ai-news/${news1.slug}` : "/resources/ai-news";

  // 2. Trending GitHub Repo
  const repo1 = repos[0];
  const repo1Owner = repo1?.owner || "microsoft";
  const repo1Name = repo1?.repo_name ? (repo1.repo_name.includes("/") ? repo1.repo_name.split("/")[1] : repo1.repo_name) : "autogen";
  const repo1Desc = repo1?.description || "A programming framework for building agentic AI workflows and multi-agent systems.";
  const repo1Tags = (repo1?.category_tags || repo1?.topics || ["llm", "agents"]).slice(0, 2);
  const repo1Href = repo1 ? `/resources/github-repos/${repo1.slug}` : "/resources/github-repos";
  const repo1Stars = repo1 ? formatStars(repo1.stars_count) : "45k";
  const repo1Lang = repo1?.primary_language || "Python";
  const repo1LangColor = getLangColor(repo1Lang);

  // 3. Top AI Update
  const news2 = news[1] || news[0];
  const news2Title = news2?.title || "New AI inference update announced";
  const news2Source = news2?.source_name || "NVIDIA AI";
  const news2Time = formatRelativeTime(news2?.published_at);
  const news2Excerpt = news2?.excerpt || news2?.summary || "In-depth overview of new high-performance AI deployment and optimization tools.";
  const news2Tags = (news2?.topic_tags || news2?.company_tags || ["update", "models"]).slice(0, 2);
  const news2Href = news2 ? `/resources/ai-news/${news2.slug}` : "/resources/ai-news";

  // 4. Developer Pick (Repo)
  const repo2 = repos[1] || repos[0];
  const repo2Owner = repo2?.owner || "chroma-core";
  const repo2Name = repo2?.repo_name ? (repo2.repo_name.includes("/") ? repo2.repo_name.split("/")[1] : repo2.repo_name) : "chroma";
  const repo2Desc = repo2?.description || "Open-source AI-native embedding database for fast vector similarity search.";
  const repo2Tags = (repo2?.category_tags || repo2?.topics || ["vector-db", "rag"]).slice(0, 2);
  const repo2Href = repo2 ? `/resources/github-repos/${repo2.slug}` : "/resources/github-repos";
  const repo2Stars = repo2 ? formatStars(repo2.stars_count) : "16k";
  const repo2Lang = repo2?.primary_language || "TypeScript";
  const repo2LangColor = getLangColor(repo2Lang);

  return (
    <section className="pulse-strip-section section-border-t" aria-label="AI Pulse Updates">
      <div className="container-main">
        {/* Header Row */}
        <div className="pulse-header-row">
          <div className="pulse-titles">
            <div className="pulse-live-indicator">
              <span className="pulse-live-dot" />
              <span>AI Pulse</span>
            </div>
            <p className="pulse-subtitle">
              Fresh AI updates, open-source projects, and developer resources.
            </p>
          </div>
          <div className="pulse-header-actions">
            <Link href="/resources/ai-news" className="pulse-view-all-link">
              AI News &rarr;
            </Link>
            <Link href="/resources/github-repos" className="pulse-view-all-link">
              Trendy Repos &rarr;
            </Link>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="pulse-cards-container">
          {/* Card 1: Latest AI News */}
          <article
            className="pulse-card pulse-card-news"
            style={
              {
                "--card-accent": "rgba(168, 85, 247, 0.5)",
                "--card-accent-solid": "#a855f7",
                "--icon-bg": "rgba(168, 85, 247, 0.12)",
                "--icon-color": "#c084fc",
              } as React.CSSProperties
            }
          >
            {/* Top Eyebrow: Content Tag / Badge + Relative Time */}
            <div className="pulse-card-eyebrow">
              <span className="pulse-card-badge badge-pulse-news">
                Latest AI News
              </span>
              <span className="pulse-eyebrow-meta">{news1Time}</span>
            </div>

            {/* Title & Brand Group */}
            <div className="pulse-card-main">
              <span className="pulse-card-icon" aria-hidden="true">
                <Newspaper size={18} />
              </span>
              <div className="pulse-card-heading-group">
                <h4 className="pulse-card-title">
                  <Link href={news1Href} title={news1Title}>
                    {news1Title}
                  </Link>
                </h4>
                <span className="pulse-card-subtitle">by {news1Source}</span>
              </div>
            </div>

            {/* Description */}
            <p className="pulse-card-desc">{news1Excerpt}</p>

            {/* Topic Tags */}
            {news1Tags.length > 0 && (
              <div className="pulse-card-tags">
                {news1Tags.map((tag) => (
                  <span key={tag} className="pulse-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Card Footer */}
            <div className="pulse-card-footer">
              <div className="pulse-card-footer-meta">
                <span className="pulse-live-mini-dot" />
                <span className="pulse-source-name">AI News Feed</span>
              </div>
              <Link href={news1Href} className="pulse-action-btn">
                <span>Read</span>
                <ArrowUpRight size={13} className="pulse-arrow-icon" />
              </Link>
            </div>
          </article>

          {/* Card 2: Trending GitHub Repo */}
          <article
            className="pulse-card pulse-card-repo"
            style={
              {
                "--card-accent": "rgba(234, 179, 8, 0.5)",
                "--card-accent-solid": "#eab308",
                "--icon-bg": "rgba(234, 179, 8, 0.12)",
                "--icon-color": "#fde047",
                "--lang-color": repo1LangColor,
              } as React.CSSProperties
            }
          >
            {/* Top Eyebrow: Content Tag / Badge + Stars Count */}
            <div className="pulse-card-eyebrow">
              <span className="pulse-card-badge badge-pulse-repo">
                Trending GitHub Repo
              </span>
              <span className="pulse-eyebrow-meta pulse-stars-meta">
                <Star size={11} fill="currentColor" />
                <span>{repo1Stars}</span>
              </span>
            </div>

            {/* Title & Brand Group */}
            <div className="pulse-card-main">
              <span className="pulse-card-icon" aria-hidden="true">
                <Github size={18} />
              </span>
              <div className="pulse-card-heading-group">
                <h4 className="pulse-card-title">
                  <Link href={repo1Href} title={`${repo1Owner}/${repo1Name}`}>
                    {repo1Name}
                  </Link>
                </h4>
                <span className="pulse-card-subtitle">by {repo1Owner}</span>
              </div>
            </div>

            {/* Description */}
            <p className="pulse-card-desc">{repo1Desc}</p>

            {/* Topic Tags */}
            {repo1Tags.length > 0 && (
              <div className="pulse-card-tags">
                {repo1Tags.map((tag) => (
                  <span key={tag} className="pulse-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Card Footer */}
            <div className="pulse-card-footer">
              <div className="pulse-card-footer-meta">
                {repo1Lang && (
                  <span className="pulse-lang-indicator">
                    <span className="pulse-lang-dot" style={{ background: repo1LangColor }} />
                    <span className="pulse-lang-name">{repo1Lang}</span>
                  </span>
                )}
              </div>
              <Link href={repo1Href} className="pulse-action-btn">
                <Github size={12} className="pulse-btn-icon" />
                <span>GitHub</span>
                <ArrowUpRight size={13} className="pulse-arrow-icon" />
              </Link>
            </div>
          </article>

          {/* Card 3: Top AI Update */}
          <article
            className="pulse-card pulse-card-update"
            style={
              {
                "--card-accent": "rgba(16, 185, 129, 0.5)",
                "--card-accent-solid": "#10b981",
                "--icon-bg": "rgba(16, 185, 129, 0.12)",
                "--icon-color": "#34d399",
              } as React.CSSProperties
            }
          >
            {/* Top Eyebrow: Content Tag / Badge + Relative Time */}
            <div className="pulse-card-eyebrow">
              <span className="pulse-card-badge badge-pulse-update">
                Top AI Update
              </span>
              <span className="pulse-eyebrow-meta">{news2Time}</span>
            </div>

            {/* Title & Brand Group */}
            <div className="pulse-card-main">
              <span className="pulse-card-icon" aria-hidden="true">
                <Sparkles size={18} />
              </span>
              <div className="pulse-card-heading-group">
                <h4 className="pulse-card-title">
                  <Link href={news2Href} title={news2Title}>
                    {news2Title}
                  </Link>
                </h4>
                <span className="pulse-card-subtitle">by {news2Source}</span>
              </div>
            </div>

            {/* Description */}
            <p className="pulse-card-desc">{news2Excerpt}</p>

            {/* Topic Tags */}
            {news2Tags.length > 0 && (
              <div className="pulse-card-tags">
                {news2Tags.map((tag) => (
                  <span key={tag} className="pulse-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Card Footer */}
            <div className="pulse-card-footer">
              <div className="pulse-card-footer-meta">
                <span className="pulse-live-mini-dot" style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)" }} />
                <span className="pulse-source-name">AI Tech Update</span>
              </div>
              <Link href={news2Href} className="pulse-action-btn">
                <span>Read</span>
                <ArrowUpRight size={13} className="pulse-arrow-icon" />
              </Link>
            </div>
          </article>

          {/* Card 4: Developer Pick */}
          <article
            className="pulse-card pulse-card-pick"
            style={
              {
                "--card-accent": "rgba(6, 182, 212, 0.5)",
                "--card-accent-solid": "#06b6d4",
                "--icon-bg": "rgba(6, 182, 212, 0.12)",
                "--icon-color": "#22d3ee",
                "--lang-color": repo2LangColor,
              } as React.CSSProperties
            }
          >
            {/* Top Eyebrow: Content Tag / Badge + Stars Count */}
            <div className="pulse-card-eyebrow">
              <span className="pulse-card-badge badge-pulse-pick">
                Developer Pick
              </span>
              <span className="pulse-eyebrow-meta pulse-stars-meta">
                <Star size={11} fill="currentColor" />
                <span>{repo2Stars}</span>
              </span>
            </div>

            {/* Title & Brand Group */}
            <div className="pulse-card-main">
              <span className="pulse-card-icon" aria-hidden="true">
                <Github size={18} />
              </span>
              <div className="pulse-card-heading-group">
                <h4 className="pulse-card-title">
                  <Link href={repo2Href} title={`${repo2Owner}/${repo2Name}`}>
                    {repo2Name}
                  </Link>
                </h4>
                <span className="pulse-card-subtitle">by {repo2Owner}</span>
              </div>
            </div>

            {/* Description */}
            <p className="pulse-card-desc">{repo2Desc}</p>

            {/* Topic Tags */}
            {repo2Tags.length > 0 && (
              <div className="pulse-card-tags">
                {repo2Tags.map((tag) => (
                  <span key={tag} className="pulse-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Card Footer */}
            <div className="pulse-card-footer">
              <div className="pulse-card-footer-meta">
                {repo2Lang && (
                  <span className="pulse-lang-indicator">
                    <span className="pulse-lang-dot" style={{ background: repo2LangColor }} />
                    <span className="pulse-lang-name">{repo2Lang}</span>
                  </span>
                )}
              </div>
              <Link href={repo2Href} className="pulse-action-btn">
                <Github size={12} className="pulse-btn-icon" />
                <span>GitHub</span>
                <ArrowUpRight size={13} className="pulse-arrow-icon" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
