import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft, CheckCircle2, Shield, Zap, HelpCircle, FileText, Edit3, Sparkles } from "lucide-react";
import { getOurTools, getOurToolBySlug, OurTool } from "@/data/our-tools";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tools = getOurTools();
  const params: { slug: string }[] = [];
  tools.forEach((t) => {
    t.aliases.forEach((alias) => {
      params.push({ slug: alias });
    });
  });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getOurToolBySlug(slug);

  if (!tool) {
    return {
      title: "Tool Not Found",
    };
  }

  return {
    title: `${tool.metaTitle} | ${SITE_NAME}`,
    description: tool.metaDescription,
    alternates: {
      canonical: absoluteUrl(`/our-tools/${tool.slug}`),
    },
    openGraph: {
      title: `${tool.name} - ${tool.subtitle}`,
      description: tool.shortDescription,
      url: absoluteUrl(`/our-tools/${tool.slug}`),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} - ${tool.subtitle}`,
      description: tool.shortDescription,
    },
  };
}

function getIconComponent(iconName: OurTool["icon"]) {
  switch (iconName) {
    case "file-text":
      return FileText;
    case "edit-3":
      return Edit3;
    default:
      return Sparkles;
  }
}

export default async function OurToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = getOurToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const IconComponent = getIconComponent(tool.icon);

  // SEO Schema
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    operatingSystem: "Web",
    applicationCategory: tool.category,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: tool.shortDescription,
    url: tool.externalUrl,
  };

  return (
    <div className="our-tool-detail-page" style={{ paddingTop: "var(--header-height)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      {/* Hero Header */}
      <section 
        className="section-padding"
        style={{
          background: "radial-gradient(1100px 520px at 50% -10%, rgba(99, 102, 241, 0.12), transparent 70%), var(--bg-secondary)",
          borderBottom: "1px solid var(--border-subtle)"
        }}
      >
        <div className="container-main" style={{ maxWidth: "1000px" }}>
          {/* Back link */}
          <div style={{ marginBottom: "24px" }}>
            <Link 
              href="/our-tools" 
              className="btn-ghost btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--slate-300)" }}
            >
              <ArrowLeft size={14} /> Back to Our Tools
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px", alignItems: "center" }}>
            <div>
              {/* Badge & Category */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                <span className="badge badge-free">
                  {tool.badge}
                </span>
                <span className="badge" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--slate-300)" }}>
                  {tool.category}
                </span>
              </div>

              {/* Title & Tagline */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <div 
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: tool.accentColor,
                    flexShrink: 0
                  }}
                >
                  <IconComponent size={24} />
                </div>
                <div>
                  <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
                    {tool.name}
                  </h1>
                  <span style={{ fontSize: "14px", color: "var(--slate-300)", fontWeight: "500" }}>
                    {tool.subtitle}
                  </span>
                </div>
              </div>

              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "var(--highlight-accent)", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                {tool.tagline}
              </h2>

              <p style={{ fontSize: "15px", color: "var(--slate-300)", lineHeight: "1.6", margin: "0 0 28px 0", maxWidth: "750px" }}>
                {tool.description}
              </p>

              {/* Launch CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <a
                  href={tool.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: "12px 24px",
                    fontSize: "15px",
                    fontWeight: "700",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>Open {tool.name}</span>
                  <ExternalLink size={16} />
                </a>

                <span style={{ fontSize: "13px", color: "var(--slate-300)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={14} style={{ color: "var(--success)" }} /> No sign-up required • Instant access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Provided Section */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main" style={{ maxWidth: "1000px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: "800", margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Services Provided by {tool.name}
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {tool.services.map((srv, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: "24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-xl)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  {/* Top line with title and badges */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
                        {srv.title}
                      </h3>
                      {srv.badge && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "800",
                            letterSpacing: "0.04em",
                            padding: "2px 7px",
                            borderRadius: "10px",
                            background: "#f43f5e",
                            color: "#ffffff",
                            textTransform: "uppercase"
                          }}
                        >
                          {srv.badge}
                        </span>
                      )}
                    </div>

                    {srv.format && (
                      <span 
                        style={{ 
                          fontSize: "10px", 
                          fontWeight: "700", 
                          padding: "3px 8px", 
                          borderRadius: "4px", 
                          background: "var(--bg-secondary)", 
                          color: "var(--highlight-accent)", 
                          border: "1px solid var(--border-subtle)",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {srv.format}
                      </span>
                    )}
                  </div>

                  {srv.subtitle && (
                    <div style={{ fontSize: "12px", color: tool.accentColor, fontWeight: "600", marginBottom: "10px" }}>
                      {srv.subtitle}
                    </div>
                  )}

                  <p style={{ fontSize: "13.5px", color: "var(--slate-300)", lineHeight: "1.6", margin: "0 0 20px 0" }}>
                    {srv.description}
                  </p>
                </div>

                <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                  <a
                    href={tool.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm"
                    style={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: "700",
                      textDecoration: "none"
                    }}
                  >
                    <span>Use {srv.title}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding" style={{ background: "var(--bg-primary)" }}>
        <div className="container-main" style={{ maxWidth: "1000px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 12px 0", color: "var(--text-primary)" }}>
              Powerful Features & Capabilities
            </h2>
            <p style={{ fontSize: "15px", color: "var(--slate-300)", margin: 0 }}>
              Everything you need to work efficiently without bloated software.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {tool.features.map((feat, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: "24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <CheckCircle2 size={18} style={{ color: tool.accentColor }} />
                  <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                    {feat.title}
                  </h3>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--slate-300)", lineHeight: "1.5", margin: 0 }}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main" style={{ maxWidth: "1000px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 12px 0", color: "var(--text-primary)" }}>
              Designed For Your Workflow
            </h2>
            <p style={{ fontSize: "15px", color: "var(--slate-300)", margin: 0 }}>
              How creators, developers, and professionals utilize {tool.name}.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {tool.useCases.map((uc, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: "24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)"
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--highlight-accent)", margin: "0 0 8px 0" }}>
                  {uc.title}
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--slate-300)", lineHeight: "1.5", margin: 0 }}>
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-primary)" }}>
        <div className="container-main" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 8px 0", color: "var(--text-primary)" }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: "14px", color: "var(--slate-300)", margin: 0 }}>
              Quick answers about privacy, usage, and compatibility.
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {tool.faq.map((item, index) => (
              <div
                key={index}
                className="card"
                style={{
                  padding: "20px 24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-lg)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <HelpCircle size={16} style={{ color: "var(--brand)" }} />
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                    {item.question}
                  </h3>
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--slate-300)", lineHeight: "1.6", margin: 0, paddingLeft: "26px" }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main" style={{ maxWidth: "800px", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 12px 0" }}>
            Ready to start using {tool.name}?
          </h2>
          <p style={{ fontSize: "15px", color: "var(--slate-300)", margin: "0 0 28px 0" }}>
            No installation, downloads, or registration. Launch {tool.name} directly in your browser.
          </p>

          <a
            href={tool.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "700",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>Launch {tool.name} Now</span>
            <ExternalLink size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
