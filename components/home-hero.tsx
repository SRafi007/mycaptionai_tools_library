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
        
        {/* Main Title (Inspired by TAAFT) */}
        <h1 className="hero-title-inspiration">
          BEST AI TOOLS DIRECTORY
        </h1>
        
        {/* Categories Parent Group cloud */}
        <div className="hero-parent-groups">
          {parentGroups.map((group, idx) => {
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

        {/* View All Sections Toggle Button */}
        <div className="hero-toggle-row">
          <Link href="/ai-tools" className="btn-outline hero-view-all-btn">
            View all sections
          </Link>
        </div>

        {/* Sponsor Banner */}
        {sponsoredTool && (
          <div className="hero-sponsor-wrapper">
            <span className="hero-sponsor-badge">Sponsor</span>
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

        {/* Search Input Bar row */}
        <div className="hero-search-row-single">
          <SearchBar placeholder="Search..." />
        </div>

        {/* Sub-tagline below Search */}
        <p className="hero-tagline-sub">
          #1 directory for AI tools. Used by thousands of creators &amp; developers.
        </p>

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
            <div className="hero-stat-label">To Use</div>
          </div>
        </div>
      </div>
    </section>
  );
}
