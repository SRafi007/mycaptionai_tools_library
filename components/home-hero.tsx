import Link from "next/link";
import AnimatedCounter from "@/components/animated-counter";
import SearchBar from "@/components/search-bar";

interface HomeHeroProps {
  toolCount: number;
  categoryCount: number;
}

export default function HomeHero({ toolCount, categoryCount }: HomeHeroProps) {
  return (
    <section className="hero hero-v2">
      <div className="hero-orb hero-orb-a" aria-hidden="true" />
      <div className="hero-orb hero-orb-b" aria-hidden="true" />
      <div className="hero-content">
        <h1 className="hero-title">
          <span>Best AI Tools Directory</span>
          <span className="hero-title-accent">
            for Creators,
            <br className="hero-title-mobile-break" />
            Marketers &amp; Teams
          </span>
        </h1>
        <div className="hero-search-row">
          <div className="hero-search-shell">
            <SearchBar placeholder={`Search ${toolCount.toLocaleString()}+ AI tools...`} />
          </div>
          <Link href="/ai-tools" className="btn-primary hero-search-cta">
            Browse all tools &rarr;
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
