import Link from "next/link";

const columns = [
    {
        title: "Discover",
        links: [
            { href: "/browse", label: "Browse All" },
            { href: "/top-rated", label: "Top Rated" },
            { href: "/search", label: "Search" },
        ],
    },
    {
        title: "Company",
        links: [
            { href: "/submit", label: "Submit a Tool" },
            { href: "/about", label: "About" },
        ],
    },
    {
        title: "Legal",
        links: [
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="container-main footer-inner">
                {/* Grid */}
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-brand-link">
                            <div className="header-logo">M</div>
                            <span className="header-brand-text">MyCaptionAI</span>
                        </Link>
                        <p className="footer-tagline">
                            The AI tools directory built for creators, marketers, and developers.
                            Discover, compare, and choose the right AI tool for any task.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {columns.map((col) => (
                        <div key={col.title}>
                            <p className="footer-col-title">{col.title}</p>
                            <ul className="footer-col-links">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="footer-link">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} MyCaptionAI. All rights reserved.
                    </p>
                    <p className="footer-credit">Built for creators ✨</p>
                </div>
            </div>
        </footer>
    );
}
