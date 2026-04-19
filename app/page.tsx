import { Metadata } from "next";
import { getFeaturedTools, getTrendingTools, getToolCount } from "@/lib/db/tools";
import { getTopCategories, getTrendingCategories } from "@/lib/db/categories";
import { getSettings } from "@/lib/db/settings";
import ToolCard from "@/components/tool-card";
import CategoryCard from "@/components/category-card";
import SearchBar from "@/components/search-bar";
import BackToTop from "@/components/back-to-top";
import AnimatedCounter from "@/components/animated-counter";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import { getEcosystemsWithPreview } from "@/lib/db/ecosystems";
import { getPublishedPlaybooks } from "@/lib/db/playbooks";
import EcosystemCard from "@/components/ecosystem-card";
import PlaybookCard from "@/components/playbook-card";

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
  const settings = await getSettings(["featured_count", "trending_count"]);

  const featuredCount = (settings.featured_count as number) || 6;
  const trendingCount = (settings.trending_count as number) || 6;

  const [featuredTools, trendingTools, trendingCategories, categories, toolCount, ecosystems, playbooks] = await Promise.all([
    getFeaturedTools(featuredCount),
    getTrendingTools(trendingCount),
    getTrendingCategories(10),
    getTopCategories(12),
    getToolCount(),
    getEcosystemsWithPreview(5),
    getPublishedPlaybooks(),
  ]);

  const trustedTools = featuredTools.filter((tool) => tool.icon_url).slice(0, 7);

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }} />
      <section className="hero hero-v2">
        <div className="hero-orb hero-orb-a" aria-hidden="true" />
        <div className="hero-orb hero-orb-b" aria-hidden="true" />
        <div className="hero-content">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            Discover {toolCount.toLocaleString()}+ AI Tools
          </span>
          <h1 className="hero-title">
            <span>Best AI Tools Directory</span>
            <span className="hero-title-accent">for Creators, Marketers &amp; Teams</span>
          </h1>
          <p className="hero-subtitle">
            Compare trusted AI tools across writing, video, image, and productivity — and choose the right stack with confidence.
          </p>
          <SearchBar />
          <div className="hero-cta-row">
            <Link href="/ai-tools" className="btn-primary hero-cta-primary">
              Browse all tools &rarr;
            </Link>
            <Link href="/submit" className="btn-ghost hero-cta-ghost">
              Submit a tool
            </Link>
          </div>
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
                <AnimatedCounter value={categories.length} suffix="+" />
              </div>
              <div className="hero-stat-label">Categories</div>
            </div>
            <span className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <div className="hero-stat-value">Free</div>
              <div className="hero-stat-label">To Use</div>
            </div>
          </div>

          {trustedTools.length > 0 && (
            <div className="hero-trusted">
              <span className="hero-trusted-label">Featuring tools from</span>
              <div className="hero-trusted-logos">
                {trustedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="hero-trusted-logo"
                    title={tool.name}
                    aria-label={tool.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tool.icon_url!} alt="" loading="lazy" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Ecosystems & Playbooks */}
      <section className="section-padding ecosystem-section">
        <div className="container-main">
          <div className="ecosystem-section-header">
            <span className="hero-eyebrow ecosystem-eyebrow">
              <span className="hero-eyebrow-dot" aria-hidden="true" />
              Ecosystems
            </span>
            <div className="ecosystem-section-title-row">
              <h2 className="section-title ecosystem-section-title">Explore the AI Giants</h2>
              <Link href="/ecosystems" className="btn-outline">
                All ecosystems &rarr;
              </Link>
            </div>
            <p className="ecosystem-section-lede">
              The era of 10,000 fragmented tools is over. Discover the trusted UI clients, frameworks, and playbooks built around the major AI foundational models.
            </p>
          </div>

          <div className="ecosystem-grid">
            {ecosystems.slice(0, 4).map((eco) => (
              <EcosystemCard key={eco.id} ecosystem={eco} />
            ))}
          </div>

          {playbooks.length > 0 && (
            <div className="ecosystem-playbooks">
              <div className="section-header">
                <h2 className="section-title">Trending Tech Stacks</h2>
                <Link href="/playbooks" className="btn-ghost">
                  All playbooks &rarr;
                </Link>
              </div>
              <div className="tools-grid">
                {playbooks.slice(0, 3).map((playbook) => (
                  <PlaybookCard key={playbook.id} playbook={playbook} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding section-border-t">
        <div className="container-main">
          <div className="discovery-layout">
            <aside className="popular-categories-panel">
              <div className="popular-categories-head">
                <h2 className="section-title">Most Popular Categories</h2>
              </div>
              <div className="popular-categories-list">
                {trendingCategories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="popular-category-item">
                    <span className="popular-category-name">{cat.name}</span>
                    <span className="popular-category-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/ai-tools" className="popular-categories-cta">
                View all categories &rarr;
              </Link>
            </aside>

            <div className="discovery-main">
              <div className="section-header">
                <h2 className="section-title">Featured Tools</h2>
                <span className="section-count">{featuredTools.length} tools</span>
              </div>

              {featuredTools.length > 0 ? (
                <div className="tools-grid">
                  {featuredTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} showVisitButton />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🔧</div>
                  <p className="empty-state-text">No featured tools yet. Check back soon.</p>
                </div>
              )}

              <div className="discovery-divider" />

              <div className="section-header">
                <h2 className="section-title">Trending Now</h2>
                <span className="section-count">By upvotes</span>
              </div>

              {trendingTools.length > 0 ? (
                <div className="tools-grid">
                  {trendingTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} showVisitButton />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📈</div>
                  <p className="empty-state-text">No trending tools yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding section-border-t">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <Link href="/ai-tools" className="btn-ghost">
              All categories &rarr;
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <section className="cross-grid section-padding section-border-t">
        <div className="container-main" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              margin: "0 0 8px",
            }}
          >
            Know an AI tool we&apos;re missing?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px" }}>
            Submit it and get listed in front of thousands of creators.
          </p>
          <Link href="/submit" className="btn-primary">
            Submit Tool &rarr;
          </Link>
        </div>
      </section>

      <BackToTop />
    </>
  );
}
