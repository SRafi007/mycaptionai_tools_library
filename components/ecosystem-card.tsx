import Link from "next/link";
import { Ecosystem } from "@/types/ecosystem";

export default function EcosystemCard({ ecosystem }: { ecosystem: Ecosystem }) {
    return (
        <Link href={`/ecosystems/${ecosystem.slug}`} className="card" style={{ display: "flex", flexDirection: "column", padding: "24px", height: "100%", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="tool-card-icon" style={{ width: 48, height: 48 }}>
                    {ecosystem.icon_url ? (
                        <img src={ecosystem.icon_url} alt={ecosystem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                        <span style={{ fontSize: "24px" }}>🌐</span>
                    )}
                </div>
                <h3 className="category-card-name" style={{ fontSize: "20px", margin: 0 }}>{ecosystem.name}</h3>
            </div>
            <p className="tool-card-desc" style={{ flex: 1, marginTop: 0 }}>
                {ecosystem.description || `Discover tools and playbooks built around the ${ecosystem.name} ecosystem.`}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", color: "var(--accent)" }}>
                <span className="popular-category-cta" style={{ fontSize: "14px", fontWeight: 600 }}>Explore ecosystem &rarr;</span>
            </div>
        </Link>
    );
}
