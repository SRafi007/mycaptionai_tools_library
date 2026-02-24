import { Metadata } from "next";
import { getFeaturedTools, getTrendingTools, getToolCount } from "@/lib/db/tools";
import { getTopCategories, getTrendingCategories } from "@/lib/db/categories";
import { getSettings } from "@/lib/db/settings";
import ToolCard from "@/components/tool-card";
import CategoryCard from "@/components/category-card";
import SearchBar from "@/components/search-bar";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";
import { SITE_NAME, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Best AI Tools Directory",
  description: "Discover, compare, and choose the best AI tools for creators, marketers, and teams.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: `${SITE_NAME} - Best AI Tools Directory`,
    description: "Discover, compare, and choose the best AI tools for creators, marketers, and teams.",
    url: absoluteUrl("/"),
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Best AI Tools Directory`,
    description: "Discover, compare, and choose the best AI tools for creators, marketers, and teams.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
};

export default async function HomePage() {
  const settings = await getSettings(["featured_count", "trending_count"]);

  const featuredCount = (settings.featured_count as number) || 6;
  const trendingCount = (settings.trending_count as number) || 6;

  const [featuredTools, trendingTools, trendingCategories, categories, toolCount] = await Promise.all([
    getFeaturedTools(featuredCount),
    getTrendingTools(trendingCount),
    getTrendingCategories(10),
    getTopCategories(12),
    getToolCount(),
  ]);

  // const heroSubtitle = "Compare trusted AI tools and choose with confidence.";
  const heroLabel = "Discover 4,266+ AI Tools";
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
      <section className="hero dot-grid">
        <div className="hero-accent" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-label">{heroLabel}</p>
          <h1 className="hero-title">
            <span>Best AI Tools Directory</span>
            <span>for Creators, Marketers, and Teams</span>
          </h1>
          {/* <p className="hero-subtitle">{heroSubtitle}</p> */}
          <SearchBar />
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{toolCount.toLocaleString()}+</div>
              <div className="hero-stat-label">AI Tools</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{categories.length}+</div>
              <div className="hero-stat-label">Categories</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Free</div>
              <div className="hero-stat-label">To Use</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main">
          <div className="discovery-layout">
            <aside className="popular-categories-panel card">
              <div className="popular-categories-head">
                <h2 className="section-title">Most Popular Categories</h2>
                <Link href="/browse" className="btn-ghost btn-sm">
                  View all &rarr;
                </Link>
              </div>
              <div className="popular-categories-list">
                {trendingCategories.map((cat, index) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="popular-category-item">
                    <span className="popular-category-rank">{String(index + 1).padStart(2, "0")}</span>
                    <span className="popular-category-name">{cat.name}</span>
                    <span className="popular-category-count">{cat.tool_count}</span>
                  </Link>
                ))}
              </div>
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
            <Link href="/browse" className="btn-ghost">
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
