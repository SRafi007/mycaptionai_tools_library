import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight, FileText, Edit3, Sparkles, Shield, Zap, Lock, Code } from "lucide-react";
import { getOurTools, OurTool } from "@/data/our-tools";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Our Proprietary Tools | ${SITE_NAME}`,
  description: "Explore free, privacy-first web utilities created by MyCaptionAI including our online PDF Editor and Markdown Editor.",
  alternates: {
    canonical: absoluteUrl("/our-tools"),
  },
  openGraph: {
    title: `Our Proprietary Tools | ${SITE_NAME}`,
    description: "Explore free, privacy-first web utilities created by MyCaptionAI including our online PDF Editor and Markdown Editor.",
    url: absoluteUrl("/our-tools"),
  },
};

function getToolIcon(icon: OurTool["icon"]) {
  switch (icon) {
    case "file-text":
      return FileText;
    case "edit-3":
      return Edit3;
    default:
      return Sparkles;
  }
}

export default function OurToolsPage() {
  const tools = getOurTools();

  return (
    <div className="our-tools-page" style={{ paddingTop: "var(--header-height)" }}>
      {/* Hero Section */}
      <section
        className="section-padding"
        style={{
          background: "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
          borderBottom: "1px solid var(--border-subtle)",
          textAlign: "center"
        }}
      >
        <div className="container-main" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "-0.03em", margin: "0 0 16px 0", color: "var(--text-primary)" }}>
            Proprietary Web Tools & Utilities
          </h1>

          <p style={{ fontSize: "16px", color: "var(--slate-300)", lineHeight: "1.6", margin: "0 0 24px 0" }}>
            Clean, privacy-focused, browser-first tools designed to speed up document handling, markdown writing, and daily creator tasks.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--slate-300)", background: "var(--bg-surface)", padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
              <Shield size={13} style={{ color: "var(--success)" }} /> 100% Client-Side Privacy
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--slate-300)", background: "var(--bg-surface)", padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
              <Zap size={13} style={{ color: "var(--warning)" }} /> Instant Performance
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--slate-300)", background: "var(--bg-surface)", padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--border-subtle)" }}>
              <Lock size={13} style={{ color: "var(--highlight-accent)" }} /> Zero Data Retention
            </span>
          </div>
        </div>
      </section>

      {/* Main Tools Grid (Basic General Information Only) */}
      <section className="section-padding" style={{ background: "var(--bg-primary)" }}>
        <div className="container-main">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "32px"
            }}
          >
            {tools.map((tool) => {
              const IconComponent = getToolIcon(tool.icon);

              return (
                <div
                  key={tool.id}
                  className="card"
                  style={{
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-xl)"
                  }}
                >
                  <div>
                    {/* Header line */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: tool.accentColor
                        }}
                      >
                        <IconComponent size={26} />
                      </div>

                      <span className="badge" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", fontSize: "12px", fontWeight: "600", color: "var(--slate-300)" }}>
                        {tool.badge}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                      {tool.name}
                    </h2>
                    <p style={{ fontSize: "13px", color: "var(--slate-300)", fontWeight: "500", margin: "0 0 16px 0" }}>
                      {tool.tagline}
                    </p>

                    <p style={{ fontSize: "14px", color: "var(--slate-300)", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                      {tool.shortDescription}
                    </p>

                    {/* General capabilities summary pills */}
                    <div style={{ marginBottom: "28px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {tool.presentationItems.map((item, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "12px",
                              fontWeight: "500",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: "var(--bg-secondary)",
                              color: "var(--slate-300)",
                              border: "1px solid var(--border-subtle)"
                            }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "12px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)" }}>
                    <a
                      href={tool.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <span>Use {tool.name}</span>
                      <ExternalLink size={15} />
                    </a>

                    <Link
                      href={`/our-tools/${tool.slug}`}
                      className="btn-secondary"
                      style={{
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <span>View Services</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose MyCaptionAI Tools */}
      <section className="section-padding section-border-t" style={{ background: "var(--bg-secondary)" }}>
        <div className="container-main" style={{ maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 12px 0", color: "var(--text-primary)" }}>
              Built for Speed, Privacy & Simplicity
            </h2>
            <p style={{ fontSize: "15px", color: "var(--slate-300)", margin: 0 }}>
              Why millions of creators and developers rely on client-side web tools.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <div className="card" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <Shield size={24} style={{ color: "var(--brand)", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0" }}>Local Privacy</h3>
              <p style={{ fontSize: "13px", color: "var(--slate-300)", margin: 0, lineHeight: "1.5" }}>
                Files and document text are processed inside your browser sandbox. No uploads to server databases.
              </p>
            </div>

            <div className="card" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <Zap size={24} style={{ color: "var(--warning)", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0" }}>Zero Latency</h3>
              <p style={{ fontSize: "13px", color: "var(--slate-300)", margin: 0, lineHeight: "1.5" }}>
                Instant execution without network roundtrips or server queuing bottlenecks.
              </p>
            </div>

            <div className="card" style={{ padding: "20px", background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <Code size={24} style={{ color: "var(--highlight-accent)", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 6px 0" }}>Clean Interfaces</h3>
              <p style={{ fontSize: "13px", color: "var(--slate-300)", margin: 0, lineHeight: "1.5" }}>
                No paywalls, aggressive pop-ups, or complicated menus. Pure utility designed for task completion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
