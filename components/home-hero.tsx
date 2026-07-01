"use client";

import Link from "next/link";
import AnimatedCounter from "@/components/animated-counter";
import SearchBar from "@/components/search-bar";
import { Category } from "@/types/category";
import { Tool } from "@/types/tool";

interface HomeHeroProps {
  toolCount: number;
  categoryCount: number;
  allCategories: Category[];
  sponsoredTool: Tool | null;
}

const parentGroupEmojis: Record<string, string> = {
  "AI Text Generators": "✍️",
  "AI Image Tools": "🎨",
  "AI Video Tools": "🎥",
  "AI Audio Generators": "🔊",
  "AI Code Tools": "💻",
  "AI Business Tools": "📈",
  "Automation Tools": "⚡",
  "AI Art Generators": "🖼️",
  "Misc AI Tools": "🏷️",
};

export default function HomeHero({
  toolCount,
  categoryCount,
  allCategories,
  sponsoredTool
}: HomeHeroProps) {

  // Group categories by parent_group and sum their tool counts
  const groupsMap = new Map<string, number>();
  allCategories.forEach((cat) => {
    if (!cat.parent_group) return;
    const current = groupsMap.get(cat.parent_group) || 0;
    groupsMap.set(cat.parent_group, current + (cat.tool_count || 0));
  });

  const parentGroups = Array.from(groupsMap.entries())
    .map(([name, tool_count]) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return { name, tool_count, slug };
    })
    .sort((a, b) => b.tool_count - a.tool_count);

  return (
    <section className="hero hero-v3-inspiration">
      <div className="hero-content">

        {/* Main Title (Title Case) */}
        <h1 className="hero-title-inspiration">
          Best AI Tools Directory
        </h1>

        {/* Search Input Bar row (Primary visual element) */}
        <div className="hero-search-row-single">
          <SearchBar placeholder="Search for AI tools, prompts, or workflows..." />
        </div>

        {/* Categories Parent Group chips (Horizontal Scroll on Mobile) */}
        <div className="hero-parent-groups">
          {parentGroups.slice(0, 7).map((group, idx) => {
            const emoji = parentGroupEmojis[group.name] || "🏷️";
            return (
              <Link
                key={group.name}
                href={`/search?q=${encodeURIComponent(group.name)}`}
                className="hero-parent-group-pill"
              >
                {idx === 0 && <span className="hero-pill-badge-new">New</span>}
                <span className="hero-pill-emoji">{emoji}</span>
                <span className="hero-pill-name">{group.name}</span>
                <span className="hero-pill-count">{group.tool_count.toLocaleString()}</span>
              </Link>
            );
          })}
        </div>

        {/* View All Sections Toggle Link */}
        <div className="hero-toggle-row">
          <Link href="/ai-tools" className="hero-view-all-btn">
            View all sections &rarr;
          </Link>
        </div>

        {/* Featured Banner (Relocated below categories) */}
        {sponsoredTool && (
          <div className="hero-sponsor-wrapper">
            <span className="hero-sponsor-badge">Featured</span>
            <Link href={`/tools/${sponsoredTool.slug}`} className="hero-sponsor-banner">
              {sponsoredTool.icon_url && (
                <img
                  src={sponsoredTool.icon_url}
                  alt=""
                  className="hero-sponsor-icon"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
              <span className="hero-sponsor-text">
                <strong>{sponsoredTool.name}</strong> — {sponsoredTool.short_description}
              </span>
            </Link>
          </div>
        )}

        {/* Home page metrics */}
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-value">
              <AnimatedCounter value={toolCount} suffix="+" />
            </div>
            <div className="hero-stat-label">AI Tools</div>
          </div>
          <span className="hero-stat-divider" aria-hidden="true" />
          <div className="hero-stat">
            <div className="hero-stat-value">
              <AnimatedCounter value={categoryCount} suffix="+" />
            </div>
            <div className="hero-stat-label">Categories</div>
          </div>
          <span className="hero-stat-divider" aria-hidden="true" />
          <div className="hero-stat">
            <div className="hero-stat-value">Free</div>
            <div className="hero-stat-label">To Browse</div>
          </div>
        </div>
      </div>
    </section>
  );
}
