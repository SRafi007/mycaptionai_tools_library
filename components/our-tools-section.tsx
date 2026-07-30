import Link from "next/link";
import { 
  ExternalLink, 
  ArrowRight, 
  FileText, 
  Edit3, 
  Sparkles,
  GitMerge,
  Scissors,
  Minimize2,
  FileCode,
  Code,
  FileCheck,
  ArrowRightLeft,
  Plus,
  FileType
} from "lucide-react";
import { getOurTools, OurTool, OurToolCapability } from "@/data/our-tools";

function getToolIconComponent(icon: OurTool["icon"]) {
  switch (icon) {
    case "file-text":
      return FileText;
    case "edit-3":
      return Edit3;
    default:
      return Sparkles;
  }
}

function getCapabilityIcon(iconType: OurToolCapability["icon"]) {
  switch (iconType) {
    case "pdf-editor":
      return FileText;
    case "merge":
      return GitMerge;
    case "split":
      return Scissors;
    case "compress":
      return Minimize2;
    case "pdf-word":
      return FileType;
    case "md-editor":
      return Edit3;
    case "md-pdf":
      return FileCheck;
    case "md-docx":
      return FileText;
    case "pdf-md":
      return ArrowRightLeft;
    case "md-html":
      return Code;
    case "and-more":
      return Plus;
    default:
      return Sparkles;
  }
}

export default function OurToolsSection() {
  const tools = getOurTools();

  return (
    <section className="section-padding section-border-t our-tools-home-section" style={{ background: "var(--bg-primary)" }}>
      <div className="container-main">
        {/* Minimal Section Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2 
            style={{ 
              fontSize: "26px", 
              fontWeight: "800", 
              letterSpacing: "-0.02em", 
              margin: 0, 
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <span>Use Our Tools - Free</span>
            <span 
              style={{
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "var(--brand)",
                border: "1px solid var(--brand-muted)"
              }}
            >
              100% Free
            </span>
          </h2>
        </div>

        {/* Minimal Tool Presentation Cards Grid */}
        <div 
          className="our-tools-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px"
          }}
        >
          {tools.map((tool) => {
            const MainIcon = getToolIconComponent(tool.icon);

            return (
              <div
                key={tool.id}
                className="card our-tool-card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-xl)",
                  transition: "all var(--transition)"
                }}
              >
                {/* Top Accent Line */}
                <div 
                  style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: "3px", 
                    background: `linear-gradient(90deg, ${tool.accentColor}, transparent)` 
                  }} 
                />

                <div>
                  {/* Tool Header: Icon + Title & Subtitle */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                    <div 
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: tool.accentColor,
                        flexShrink: 0
                      }}
                    >
                      <MainIcon size={22} />
                    </div>

                    <div>
                      <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-primary)", margin: "0 0 2px 0", letterSpacing: "-0.01em" }}>
                        {tool.name}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--slate-300)", fontWeight: "500", display: "block" }}>
                        {tool.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Capabilities Sub-Cards Grid (6 items in 3x2 grid) */}
                  <div 
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "10px",
                      marginBottom: "20px"
                    }}
                  >
                    {tool.capabilities.map((cap, idx) => {
                      const CapIcon = getCapabilityIcon(cap.icon);

                      return (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-lg)",
                            padding: "10px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            minHeight: "76px"
                          }}
                        >
                          {/* Top Row: Icon Box & Badge */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                background: cap.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff"
                              }}
                            >
                              <CapIcon size={14} />
                            </div>

                            {cap.badge && (
                              <span
                                style={{
                                  fontSize: "8px",
                                  fontWeight: "800",
                                  letterSpacing: "0.04em",
                                  padding: "2px 5px",
                                  borderRadius: "8px",
                                  background: "#f43f5e",
                                  color: "#ffffff",
                                  textTransform: "uppercase"
                                }}
                              >
                                {cap.badge}
                              </span>
                            )}
                          </div>

                          {/* Sub-card Title */}
                          <div 
                            style={{ 
                              fontSize: "12px", 
                              fontWeight: "700", 
                              color: "var(--text-primary)", 
                              marginTop: "8px",
                              lineHeight: "1.2",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                            title={cap.title}
                          >
                            {cap.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                  <a
                    href={tool.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary btn-sm"
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "9px 14px",
                      fontSize: "13px",
                      fontWeight: "700",
                      textDecoration: "none"
                    }}
                  >
                    <span>Use {tool.name}</span>
                    <ExternalLink size={13} />
                  </a>

                  <Link
                    href={`/our-tools/${tool.slug}`}
                    className="btn-secondary btn-sm"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "9px 14px",
                      fontSize: "13px",
                      fontWeight: "600",
                      textDecoration: "none"
                    }}
                  >
                    <span>Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
