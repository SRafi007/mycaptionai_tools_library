import { getFeaturedTools, getTrendingTools, getToolCount } from "@/lib/db/tools";
import { getTopCategories, getTrendingCategories } from "@/lib/db/categories";
import { getSettings } from "@/lib/db/settings";
import ToolCard from "@/components/tool-card";
import CategoryCard from "@/components/category-card";
import SearchBar from "@/components/search-bar";
import BackToTop from "@/components/back-to-top";
import Link from "next/link";

export default async function HomePage() {
  const settings = await getSettings([
    "hero_title", "hero_subtitle", "hero_label",
    "featured_count", "trending_count",
  ]);

  const featuredCount = (settings.featured_count as number) || 6;
  const trendingCount = (settings.trending_count as number) || 6;

  const [featuredTools, trendingTools, trendingCategories, categories, toolCount] = await Promise.all([
    getFeaturedTools(featuredCount),
    getTrendingTools(trendingCount),
    getTrendingCategories(10),
    getTopCategories(12),
    getToolCount(),
  ]);

  const heroTitle = ((settings.hero_title as string) || "Discover {count}+ AI Tools")
    .replace("{count}", toolCount.toLocaleString());
  const heroSubtitle = (settings.hero_subtitle as string) || "Find the perfect AI tool for any task. Curated, rated, and ranked for creators, marketers, and developers.";
  const heroLabel = (settings.hero_label as string) || "AI Tools Directory";

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="hero dot-grid">
        <div className="hero-accent" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-label">{heroLabel}</p>
          <h1 className="hero-title">{heroTitle}</h1>
          <p className="hero-subtitle">{heroSubtitle}</p>
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

      {/* ─── Trending Categories ─── */}
      <section className="section-padding" style={{ paddingBottom: 0 }}>
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Trending Categories</h2>
            <Link href="/browse" className="btn-ghost">
              View all →
            </Link>
          </div>
          <div className="trending-scroll">
            {trendingCategories.map((cat) => (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="trending-pill">
                <span className="trending-pill-icon">📂</span>
                {cat.name}
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  {cat.tool_count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured ─── */}
      <section className="section-padding">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Featured Tools</h2>
            <span className="section-count">{featuredTools.length} tools</span>
          </div>

          {featuredTools.length > 0 ? (
            <div className="tools-grid">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <p className="empty-state-text">No featured tools yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Trending ─── */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <span className="section-count">By upvotes</span>
          </div>

          {trendingTools.length > 0 ? (
            <div className="tools-grid">
              {trendingTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <p className="empty-state-text">No trending tools yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Browse Categories ─── */}
      <section className="section-padding section-border-t">
        <div className="container-main">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <Link href="/browse" className="btn-ghost">
              All categories →
            </Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Submit CTA ─── */}
      <section className="cross-grid section-padding section-border-t">
        <div className="container-main" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
            Know an AI tool we&apos;re missing?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px" }}>
            Submit it and get listed in front of thousands of creators.
          </p>
          <Link href="/submit" className="btn-primary">
            Submit Tool →
          </Link>
        </div>
      </section>

      <BackToTop />
    </>
  );
}
