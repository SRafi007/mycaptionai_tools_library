"use client";

import Link from "next/link";

interface CountryItem {
  iso: string;
  name: string;
  count: number;
  slug: string;
  emoji: string;
}

const TOP_COUNTRIES: CountryItem[] = [
  { iso: "US", name: "United States", count: 782, slug: "united-states", emoji: "🇺🇸" },
  { iso: "GB", name: "United Kingdom", count: 114, slug: "united-kingdom", emoji: "🇬🇧" },
  { iso: "CA", name: "Canada", count: 88, slug: "canada", emoji: "🇨🇦" },
  { iso: "FR", name: "France", count: 79, slug: "france", emoji: "🇫🇷" },
  { iso: "DE", name: "Germany", count: 64, slug: "germany", emoji: "🇩🇪" },
  { iso: "IN", name: "India", count: 52, slug: "india", emoji: "🇮🇳" },
];

export default function HomeCountryDirectory() {
  return (
    <section className="section-padding home-country-section">
      <div className="container-main">
        <div className="section-header home-country-header">
          <div>
            <h2 className="section-title">AI Innovation by Country</h2>
            <p className="section-subtitle-text">
              Discover and explore AI companies, tools, and startup ecosystems across global tech hubs.
            </p>
          </div>
          <Link href="/ai-by-country" className="btn-ghost desktop-only-link">
            Interactive World Map &rarr;
          </Link>
        </div>

        <div className="home-country-grid">
          {TOP_COUNTRIES.map((country) => (
            <Link
              key={country.iso}
              href={`/ai-by-country/${country.slug}`}
              className="home-country-card"
            >
              <div className="home-country-card-header">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://flagcdn.com/w40/${country.iso.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  width={28}
                  height={20}
                  loading="lazy"
                  className="home-country-flag"
                />
                <span className="home-country-badge">Top Hub</span>
              </div>
              <h3 className="home-country-card-name">{country.name}</h3>
              <p className="home-country-card-count">
                <strong>{country.count}</strong> AI tools & platforms
              </p>
            </Link>
          ))}
        </div>

        <div className="mobile-only-btn-wrapper">
          <Link href="/ai-by-country" className="btn-secondary full-width-btn">
            Explore Interactive World Map &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
