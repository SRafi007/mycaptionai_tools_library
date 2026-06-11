"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  tool_count: number;
}

interface HomeSidebarDiscoveryProps {
  categories: CategoryTab[];
  trendingCount: number;
  /** Pre-rendered server content panels, each wrapped in a div with data-sidebar-panel attribute */
  panels: React.ReactNode;
}

const categoryIcons: Record<string, string> = {
  "text-generators": "✍️",
  "image-generators": "🎨",
  "video-generators": "🎬",
  "audio-generators": "🎵",
  "code-generators": "💻",
  "chatbots": "💬",
  "marketing": "📈",
  "productivity": "⚡",
  "writing": "📝",
  "design": "🎯",
  "education": "📚",
  "research": "🔬",
  "business": "💼",
  "social-media": "📱",
  "seo": "🔍",
  "automation": "🤖",
  "analytics": "📊",
  "e-commerce": "🛒",
  "healthcare": "🏥",
  "finance": "💰",
  "customer-service": "🎧",
  "hr": "👥",
  "legal": "⚖️",
  "music": "🎶",
  "gaming": "🎮",
  "photo-editing": "📸",
  "presentation": "📊",
  "transcription": "📋",
  "translation": "🌐",
  "email": "📧",
};

function getCategoryIcon(slug: string): string {
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (slug.includes(key)) return icon;
  }
  return "🔧";
}

export default function HomeSidebarDiscovery({
  categories,
  trendingCount,
  panels,
}: HomeSidebarDiscoveryProps) {
  const [activeTab, setActiveTab] = useState<string>("trending");
  const contentRef = useRef<HTMLDivElement>(null);

  // Toggle panel visibility based on activeTab
  useEffect(() => {
    if (!contentRef.current) return;
    const allPanels = contentRef.current.querySelectorAll("[data-sidebar-panel]");
    allPanels.forEach((panel) => {
      const panelId = panel.getAttribute("data-sidebar-panel");
      if (panelId === activeTab) {
        panel.classList.add("sidebar-panel-active");
      } else {
        panel.classList.remove("sidebar-panel-active");
      }
    });
  }, [activeTab]);

  return (
    <section className="section-padding section-border-t">
      <div className="container-main">
        <div className="sidebar-discovery">
          {/* Sidebar Navigation */}
          <aside className="sidebar-discovery-nav" role="navigation" aria-label="Category navigation">
            <div className="sidebar-nav-header">
              <h2 className="sidebar-nav-title">Explore</h2>
            </div>

            <nav className="sidebar-nav-list">
              {/* Trending Now tab */}
              <button
                className={`sidebar-nav-item${activeTab === "trending" ? " sidebar-nav-item-active" : ""}`}
                onClick={() => setActiveTab("trending")}
                aria-current={activeTab === "trending" ? "page" : undefined}
              >
                <span className="sidebar-nav-icon">🔥</span>
                <span className="sidebar-nav-label">Trending Now</span>
                <span className="sidebar-nav-count">{trendingCount}</span>
              </button>

              {/* Category tabs */}
              {categories.map((cat) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`sidebar-nav-item${isActive ? " sidebar-nav-item-active" : ""}`}
                    onClick={() => setActiveTab(cat.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="sidebar-nav-icon">
                      {getCategoryIcon(cat.slug)}
                    </span>
                    <span className="sidebar-nav-label">{cat.name}</span>
                    <span className="sidebar-nav-count">{cat.tool_count}</span>
                  </button>
                );
              })}
            </nav>

            <Link href="/ai-tools" className="sidebar-nav-cta">
              View all categories &rarr;
            </Link>
          </aside>

          {/* Main Content Area — server-rendered panels, visibility toggled via useEffect */}
          <div className="sidebar-content-area" ref={contentRef}>
            {panels}
          </div>
        </div>
      </div>
    </section>
  );
}
