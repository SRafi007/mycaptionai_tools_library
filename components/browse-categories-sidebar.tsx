"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image,
  Film,
  Music,
  Code,
  MessageSquare,
  Megaphone,
  Zap,
  Edit,
  Palette,
  GraduationCap,
  FlaskConical,
  Briefcase,
  Share2,
  Search,
  Bot,
  LineChart,
  ShoppingCart,
  Activity,
  Coins,
  Headphones,
  Users,
  Gavel,
  Gamepad2,
  Camera,
  Presentation,
  Languages,
  Mail,
  FolderOpen,
  LucideIcon
} from "lucide-react";

interface CategoryTab {
  id: string;
  name: string;
  slug: string;
  tool_count: number;
}

interface BrowseCategoriesSidebarProps {
  categories: CategoryTab[];
  /** Pre-rendered server content panels, each wrapped in a div with data-sidebar-panel attribute */
  panels: React.ReactNode;
}

const categoryIcons: Record<string, LucideIcon> = {
  "text-generators": FileText,
  "image-generators": Image,
  "video-generators": Film,
  "audio-generators": Music,
  "code-generators": Code,
  chatbots: MessageSquare,
  marketing: Megaphone,
  productivity: Zap,
  writing: Edit,
  design: Palette,
  education: GraduationCap,
  research: FlaskConical,
  business: Briefcase,
  "social-media": Share2,
  seo: Search,
  automation: Bot,
  analytics: LineChart,
  "e-commerce": ShoppingCart,
  healthcare: Activity,
  finance: Coins,
  "customer-service": Headphones,
  hr: Users,
  legal: Gavel,
  music: Music,
  gaming: Gamepad2,
  "photo-editing": Camera,
  presentation: Presentation,
  transcription: FileText,
  translation: Languages,
  email: Mail,
};

function getCategoryIcon(slug: string): LucideIcon {
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (slug.includes(key)) return icon;
  }
  return FolderOpen;
}

export default function BrowseCategoriesSidebar({
  categories,
  panels,
}: BrowseCategoriesSidebarProps) {
  // Default to the first category if available
  const [activeTab, setActiveTab] = useState<string>(
    categories.length > 0 ? categories[0].id : ""
  );
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
    <div className="sidebar-discovery" style={{ marginTop: "2rem" }}>
      {/* Sidebar Navigation */}
      <aside className="sidebar-discovery-nav" role="navigation" aria-label="Category navigation">
        <div className="sidebar-nav-header">
          <h2 className="sidebar-nav-title">CATEGORIES</h2>
        </div>

        <nav className="sidebar-nav-list">
          {/* Category tabs */}
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            const IconComp = getCategoryIcon(cat.slug);
            return (
              <button
                key={cat.id}
                className={`sidebar-nav-item${isActive ? " sidebar-nav-item-active" : ""}`}
                onClick={() => setActiveTab(cat.id)}
                aria-current={isActive ? "page" : undefined}
              >
                <IconComp className="sidebar-nav-icon sidebar-nav-lucide-icon" size={20} aria-hidden="true" />
                <span className="sidebar-nav-label" style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span>{cat.name}</span>
                  <span className="sidebar-nav-count" style={{ fontSize: "11px", opacity: 0.7, marginLeft: "8px" }}>({cat.tool_count})</span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area - server-rendered panels, visibility toggled via useEffect */}
      <div className="sidebar-content-area" ref={contentRef}>
        {panels}
      </div>
    </div>
  );
}
