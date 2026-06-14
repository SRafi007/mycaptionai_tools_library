"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PromptType } from "@/types/prompt";

interface PromptTypeTab {
  type: PromptType;
  count: number;
}

interface HomePromptsSectionProps {
  promptTypes: PromptTypeTab[];
  /** Pre-rendered server content panels, each wrapped in a div with data-prompt-panel attribute */
  panels: React.ReactNode;
}

const promptTypeIcons: Record<string, string> = {
  chat: "chat_bubble",
  image: "image",
  video: "movie",
  code: "code",
  seo: "search",
  business: "business_center",
  marketing: "campaign",
  caption: "closed_caption",
  agent: "smart_toy",
  workflow: "account_tree",
  education: "school",
  other: "auto_awesome",
};

export default function HomePromptsSection({
  promptTypes,
  panels,
}: HomePromptsSectionProps) {
  // If there are prompt types available, default to the first one
  const [activeTab, setActiveTab] = useState<string>(
    promptTypes.length > 0 ? promptTypes[0].type : "chat"
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const allPanels = contentRef.current.querySelectorAll("[data-prompt-panel]");
    allPanels.forEach((panel) => {
      const panelId = panel.getAttribute("data-prompt-panel");
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
        <div className="section-header">
          <h2 className="section-title">Prompt Library</h2>
          <p className="section-subtitle">Discover ready-to-use prompts for top AI models.</p>
        </div>

        <div className="sidebar-discovery" style={{ marginTop: "2rem" }}>
          {/* Sidebar Navigation */}
          <aside className="sidebar-discovery-nav" role="navigation" aria-label="Prompt types navigation">
            <div className="sidebar-nav-header">
              <h2 className="sidebar-nav-title">Use Cases</h2>
            </div>

            <nav className="sidebar-nav-list">
              {promptTypes.map((tab) => {
                const isActive = activeTab === tab.type;
                return (
                  <button
                    key={tab.type}
                    className={`sidebar-nav-item${isActive ? " sidebar-nav-item-active" : ""}`}
                    onClick={() => setActiveTab(tab.type)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="sidebar-nav-icon sidebar-nav-material-icon" aria-hidden="true">
                      {promptTypeIcons[tab.type] || "auto_awesome"}
                    </span>
                    <span className="sidebar-nav-label" style={{ textTransform: "capitalize" }}>
                      {tab.type}
                    </span>
                  </button>
                );
              })}
            </nav>

            <Link href="/prompts" className="sidebar-nav-cta">
              View all prompts &rarr;
            </Link>
          </aside>

          {/* Main Content Area */}
          <div className="sidebar-content-area" ref={contentRef}>
            {panels}
          </div>
        </div>
      </div>
    </section>
  );
}
