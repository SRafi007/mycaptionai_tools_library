import { Metadata } from "next";
import { getFeaturedTools, getTrendingTools, getToolCount, getSponsoredTool, getTopToolsByCategory } from "@/lib/db/tools";
import { getTrendingCategories, getCategories } from "@/lib/db/categories";
import { getSettings } from "@/lib/db/settings";
import ToolCard from "@/components/tool-card";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import HomeHero from "@/components/home-hero";
import HomeSidebarDiscovery from "@/components/home-sidebar-discovery";
import { getEcosystemsWithPreview } from "@/lib/db/ecosystems";
import { getPublishedPlaybooks } from "@/lib/db/playbooks";
import EcosystemCard from "@/components/ecosystem-card";
import PlaybookCard from "@/components/playbook-card";
import HomePromptsSection from "@/components/home-prompts-section";
import PromptCard from "@/components/prompt-card";
import { getPromptTypeCounts, getTopPromptsByType } from "@/lib/db/prompts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Best AI Tools Directory for Creators, Marketers, and Teams",
  description: "Discover, compare, and choose AI tools across writing, video, image, marketing, and productivity workflows.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${SITE_NAME} - Best AI Tools Directory`,
    description: "Discover and compare AI tools across writing, video, image, marketing, and productivity workflows.",
    url: absoluteUrl("/"),
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Best AI Tools Directory`,
    description: "Discover and compare AI tools across writing, video, image, marketing, and productivity workflows.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
};

export default async function HomePage() {
  const settings = await getSettings(["featured_count"]);

  const featuredCount = (settings.featured_count as number) || 6;
  const trendingCount = 12;

  const [featuredTools, trendingTools, trendingCategories, toolCount, allCategories, sponsoredTool, ecosystems, playbooks, promptTypes] = await Promise.all([
    getFeaturedTools(featuredCount),
    getTrendingTools(trendingCount),
    getTrendingCategories(10),
    getToolCount(),
    getCategories(),
    getSponsoredTool(),
    getEcosystemsWithPreview(5),
    getPublishedPlaybooks(3),
    getPromptTypeCounts(),
  ]);

  // Pre-fetch top 8 tools for each trending category (server-side, no loading states)
  const categoriesWithTools = await Promise.all(
    trendingCategories.map(async (cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      tool_count: cat.tool_count,
      tools: await getTopToolsByCategory(cat.id, 8),
    }))
  );

  // Pre-fetch top 9 prompts for each prompt type
  const promptPanelsData = await Promise.all(
    promptTypes.map(async (pt) => ({
      type: pt.type,
      prompts: await getTopPromptsByType(pt.type, 9),
    }))
  );

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best AI Tools Directory",
    url: absoluteUrl("/"),
    description: "Discover and compare AI tools by category, ratings, and use case.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: featuredTools.slice(0, 10).map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: absoluteUrl(`/tools/${tool.slug}`),
      })),
    },
  };

  // Build server-rendered content panels for each tab
  const contentPanels = (
    <>
      {/* Trending Now panel */}
      <div className="sidebar-content-panel sidebar-panel-active" data-sidebar-panel="trending">
        <div className="sidebar-content-header">
          <div>
            <h2 className="section-title">Trending Now</h2>
            <span className="section-count">By upvotes</span>
          </div>
        </div>
        {trendingTools.length > 0 ? (
          <div className="tools-grid sidebar-tools-grid">
            {trendingTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} showVisitButton />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">&#128200;</div>
            <p className="empty-state-text">No trending tools yet.</p>
          </div>
        )}
      </div>

      {/* Category panels */}
      {categoriesWithTools.map((cat) => (
        <div key={cat.id} className="sidebar-content-panel" data-sidebar-panel={cat.id}>
          <div className="sidebar-content-header">
            <div>
              <h2 className="section-title">{cat.name}</h2>
              <span className="section-count">By popularity score</span>
            </div>
            <Link href={`/category/${cat.slug}`} className="btn-ghost">
              View all {cat.tool_count} tools &rarr;
            </Link>
          </div>
          {cat.tools.length > 0 ? (
            <div className="tools-grid sidebar-tools-grid">
              {cat.tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} showVisitButton />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">&#128200;</div>
              <p className="empty-state-text">No tools found in this category yet.</p>
            </div>
          )}
        </div>
      ))}
    </>
  );

  const promptPanels = (
    <>
      {promptPanelsData.map((panel) => (
        <div key={panel.type} className="sidebar-content-panel" data-prompt-panel={panel.type}>
          <div className="sidebar-content-header">
            <div>
              <h2 className="section-title" style={{ textTransform: "capitalize" }}>{panel.type} Prompts</h2>
              <span className="section-count">Top prompts</span>
            </div>
            <Link href={`/prompts?type=${panel.type}`} className="btn-ghost">
              View all &rarr;
            </Link>
          </div>
          {panel.prompts.length > 0 ? (
            <div className="tools-grid sidebar-tools-grid">
              {panel.prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">&#128200;</div>
              <p className="empty-state-text">No prompts found for this category yet.</p>
            </div>
          )}
        </div>
      ))}
    </>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <HomeHero toolCount={toolCount} categoryCount={allCategories.length} allCategories={allCategories} sponsoredTool={sponsoredTool} />

      <HomeSidebarDiscovery
        categories={categoriesWithTools.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          tool_count: c.tool_count,
        }))}
        panels={contentPanels}
      />

      {promptTypes.length > 0 && (
        <HomePromptsSection promptTypes={promptTypes} panels={promptPanels} />
      )}

      {(ecosystems.length > 0 || playbooks.length > 0) && (
        <section className="section-padding ecosystem-section">
          <div className="container-main">
            <div className="section-header ecosystem-home-header">
              <h2 className="section-title">Explore AI Ecosystems</h2>
              <Link href="/ecosystems" className="btn-ghost">
                All ecosystems &rarr;
              </Link>
            </div>

            {ecosystems.length > 0 && (
              <div className="ecosystem-grid">
                {ecosystems.slice(0, 4).map((ecosystem) => (
                  <EcosystemCard key={ecosystem.id} ecosystem={ecosystem} />
                ))}
              </div>
            )}

            {playbooks.length > 0 && (
              <div className="ecosystem-playbooks">
                <div className="section-header">
                  <h2 className="section-title">Trending Tech Stacks</h2>
                  <Link href="/playbooks" className="btn-ghost">
                    All playbooks &rarr;
                  </Link>
                </div>
                <div className="tools-grid playbook-grid">
                  {playbooks.map((playbook) => (
                    <PlaybookCard key={playbook.id} playbook={playbook} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main cta-footer-block">
          <h2>Know an AI tool we&apos;re missing?</h2>
          <p>Submit it and get listed in front of thousands of creators.</p>
          <Link href="/submit" className="btn-primary">
            Submit Tool &rarr;
          </Link>
        </div>
      </section>

      <BackToTop />
    </>
  );
}
