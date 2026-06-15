"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PromptType } from "@/types/prompt";
import {
  TrendingUp,
  MessageSquare,
  Image,
  Film,
  Code,
  Search,
  Briefcase,
  Megaphone,
  Subtitles,
  Bot,
  Network,
  GraduationCap,
  Sparkles,
  LucideIcon
} from "lucide-react";

interface PromptTypeTab {
  type: string;
  count?: number;
}

interface HomePromptsSectionProps {
  promptTypes: PromptTypeTab[];
  /** Pre-rendered server content panels, each wrapped in a div with data-prompt-panel attribute */
  panels: React.ReactNode;
}

const promptTypeIcons: Record<string, LucideIcon> = {
  trending: TrendingUp,
  chat: MessageSquare,
  image: Image,
  video: Film,
  code: Code,
  seo: Search,
  business: Briefcase,
  marketing: Megaphone,
  caption: Subtitles,
  agent: Bot,
  workflow: Network,
  education: GraduationCap,
  other: Sparkles,
};

const promptTypeLabels: Record<string, string> = {
  trending: "Trending Now",
  chat: "Chat",
  image: "Image",
  video: "Video",
  code: "Code",
  seo: "SEO",
  business: "Business",
  marketing: "Marketing",
  caption: "Caption",
  agent: "Agent",
  workflow: "Workflow",
  education: "Education",
  other: "Other",
};

export default function HomePromptsSection({
  promptTypes,
  panels,
}: HomePromptsSectionProps) {
  // If there are prompt types available, default to the first one
  const [activeTab, setActiveTab] = useState<string>(
    promptTypes.length > 0 ? promptTypes[0].type : "trending"
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


        <div className="sidebar-discovery" style={{ marginTop: "2rem" }}>
          {/* Sidebar Navigation */}
          <aside className="sidebar-discovery-nav" role="navigation" aria-label="Prompt types navigation">
            <div className="sidebar-nav-header">
              <h2 className="sidebar-nav-title">Prompt Library</h2>
            </div>

            <nav className="sidebar-nav-list">
              {promptTypes.map((tab) => {
                const isActive = activeTab === tab.type;
                const label = promptTypeLabels[tab.type] || tab.type;
                return (
                  <button
                    key={tab.type}
                    className={`sidebar-nav-item${isActive ? " sidebar-nav-item-active" : ""}`}
                    onClick={() => setActiveTab(tab.type)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {(() => {
                      const IconComp = promptTypeIcons[tab.type] || Sparkles;
                      return <IconComp className="sidebar-nav-icon sidebar-nav-lucide-icon" size={20} aria-hidden="true" />;
                    })()}
                    <span className="sidebar-nav-label">
                      {label}
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
