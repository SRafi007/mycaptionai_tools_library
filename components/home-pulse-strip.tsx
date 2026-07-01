import Link from "next/link";
import { ArrowUpRight, Flame, Terminal, Cpu, Award } from "lucide-react";
import { AiNews, GithubRepo } from "@/types/resources";

interface HomePulseStripProps {
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

export default function HomePulseStrip({ news, repos }: HomePulseStripProps) {
  const pulseItems = [
    {
      type: "Latest AI News",
      title: news[0]?.title || "New model update released",
      source: news[0]?.source_name || "Official",
      timeOrStars: news[0] ? formatRelativeTime(news[0].published_at) : "2h ago",
      href: news[0]?.original_url || "/resources/ai-news",
      icon: <Flame size={12} className="text-[#a855f7]" />,
      badgeColor: "rgba(168, 85, 247, 0.15)",
      badgeText: "rgba(168, 85, 247, 0.8)",
    },
    {
      type: "Trending GitHub Repo",
      title: repos[0] ? `${repos[0].owner}/${repos[0].repo_name}` : "microsoft/autogen",
      source: repos[0]?.primary_language || "GitHub",
      timeOrStars: repos[0] ? `★ ${formatStars(repos[0].stars_count)}` : "★ 45k",
      href: repos[0]?.html_url || "/resources/github-repos",
      icon: <Terminal size={12} className="text-[#eab308]" />,
      badgeColor: "rgba(234, 179, 8, 0.15)",
      badgeText: "rgba(234, 179, 8, 0.8)",
    },
    {
      type: "Top AI Update",
      title: news[1]?.title || "New AI inference update announced",
      source: news[1]?.source_name || "NVIDIA",
      timeOrStars: news[1] ? formatRelativeTime(news[1].published_at) : "6h ago",
      href: news[1]?.original_url || "/resources/ai-news",
      icon: <Cpu size={12} className="text-[#10b981]" />,
      badgeColor: "rgba(16, 185, 129, 0.15)",
      badgeText: "rgba(16, 185, 129, 0.8)",
    },
    {
      type: "Developer Pick",
      title: repos[1] ? `${repos[1].owner}/${repos[1].repo_name}` : "trending vector search repo",
      source: repos[1]?.primary_language || "RAG",
      timeOrStars: repos[1] ? `★ ${formatStars(repos[1].stars_count)}` : "★ 12k",
      href: repos[1]?.html_url || "/resources/github-repos",
      icon: <Award size={12} className="text-[#06b6d4]" />,
      badgeColor: "rgba(6, 182, 212, 0.15)",
      badgeText: "rgba(6, 182, 212, 0.8)",
    },
  ];

  return (
    <section className="pulse-strip-section section-border-t">
      <div className="container-main">
        <div className="pulse-header-row">
          <div className="pulse-titles">
            <span className="pulse-live-indicator">
              <span className="pulse-live-dot"></span>
              AI Pulse
            </span>
            <p className="pulse-subtitle">
              Fresh AI updates, open-source projects, and developer resources.
            </p>
          </div>
          <Link href="/resources" className="pulse-view-all-link">
            Hub Dashboard &rarr;
          </Link>
        </div>

        {/* Pulse Grid / Horizontal Scroll */}
        <div className="pulse-cards-container">
          {pulseItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="pulse-card"
            >
              <div className="pulse-card-top">
                <span
                  className="pulse-card-badge"
                  style={{
                    backgroundColor: item.badgeColor,
                    color: item.badgeText,
                  }}
                >
                  {item.icon}
                  {item.type}
                </span>
                <span className="pulse-card-arrow-box">
                  <ArrowUpRight size={14} className="pulse-card-arrow" />
                </span>
              </div>

              <h4 className="pulse-card-title">{item.title}</h4>

              <div className="pulse-card-footer">
                <span className="pulse-card-source">[{item.source}]</span>
                <span className="pulse-card-time">{item.timeOrStars}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
