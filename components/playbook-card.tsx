import Link from "next/link";
import { Playbook } from "@/types/playbook";

export default function PlaybookCard({ playbook }: { playbook: Playbook }) {
    return (
        <Link href={`/playbooks/${playbook.slug}`} className="card" style={{ display: "flex", flexDirection: "column", padding: "24px", height: "100%", background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-secondary) 100%)", borderColor: "var(--border-subtle)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.3 }}>{playbook.title}</h3>
            <p className="tool-card-desc" style={{ marginTop: 0, flex: 1 }}>{playbook.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
                <div className="badge badge-verified" style={{ background: "var(--accent-subtle)" }}>PLAYBOOK</div>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500, marginLeft: "auto" }}>View Stack &rarr;</span>
            </div>
        </Link>
    );
}
