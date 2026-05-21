import Link from "next/link";
import { Playbook } from "@/types/playbook";

function getShortDescription(description?: string | null) {
    const clean = description?.replace(/\s+/g, " ").trim();

    if (!clean) {
        return "A practical AI workflow with recommended tools and step-by-step order.";
    }

    const firstSentence = clean.split(/(?<=[.!?])\s+/)[0];
    return firstSentence.length > 132 ? `${firstSentence.slice(0, 129).trim()}...` : firstSentence;
}

export default function PlaybookCard({ playbook }: { playbook: Playbook }) {
    return (
        <Link href={`/playbooks/${playbook.slug}`} className="card playbook-card">
            <div className="playbook-card-cover">
                {playbook.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={playbook.cover_url} 
                        alt="" 
                        className="playbook-card-cover-img"
                        loading="lazy"
                    />
                ) : (
                    <div className="playbook-card-cover-placeholder">
                        <div className="playbook-card-cover-placeholder-glow" />
                        <span className="playbook-card-cover-placeholder-symbol" aria-hidden="true">
                            {playbook.title.charAt(0)}
                        </span>
                    </div>
                )}
                <div 
                    className="playbook-card-title-overlay"
                    style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "12px",
                        right: "12px",
                        top: "auto",
                        padding: "12px 14px",
                        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(240, 240, 240, 0.35) 100%)",
                        backdropFilter: "blur(16px) saturate(140%)",
                        WebkitBackdropFilter: "blur(16px) saturate(140%)",
                        borderRadius: "14px",
                        border: "1px solid rgba(255, 255, 255, 0.65)",
                        boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                        zIndex: 5,
                        pointerEvents: "none",
                        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    <h3 
                        className="playbook-card-title"
                        style={{
                            margin: 0,
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#0f172a",
                            letterSpacing: "-0.015em",
                            lineHeight: "1.35",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textShadow: "0 1px 1px rgba(255, 255, 255, 0.5)",
                            transition: "color 0.3s ease",
                        }}
                    >
                        {playbook.title}
                    </h3>
                </div>
            </div>
            <div className="playbook-card-content">
                <p className="playbook-card-desc">{getShortDescription(playbook.description)}</p>
                <div className="playbook-card-footer">
                    <span>View stack</span>
                    <span aria-hidden="true" className="playbook-card-arrow">&rarr;</span>
                </div>
            </div>
        </Link>
    );
}
