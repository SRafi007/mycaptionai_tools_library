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
            <div className="playbook-card-cover" aria-hidden="true">
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
                        <span className="playbook-card-cover-placeholder-symbol">
                            {playbook.title.charAt(0)}
                        </span>
                    </div>
                )}
            </div>
            <div className="playbook-card-content">
                <h3 className="playbook-card-title">{playbook.title}</h3>
                <p className="playbook-card-desc">{getShortDescription(playbook.description)}</p>
                <div className="playbook-card-footer">
                    <span>View stack</span>
                    <span aria-hidden="true" className="playbook-card-arrow">&rarr;</span>
                </div>
            </div>
        </Link>
    );
}
