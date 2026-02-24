"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const navLinks = [
    { href: "/browse", label: "AI Tools" },
    { href: "/top-rated", label: "Top Rated" },
    { href: "/blog", label: "Blog" },
    { href: "/search", label: "Search" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="site-header">
                <div className="container-main header-inner">
                    {/* Brand */}
                    <Link href="/" className="header-brand">
                        <div className="header-logo">
                            <Image
                                src="/image/logo.png"
                                alt="MyCaptionAI logo"
                                width={28}
                                height={28}
                                className="header-logo-image"
                                priority
                            />
                        </div>
                        <span className="header-brand-text">MyCaptionAI</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="header-nav-desktop">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} className="header-nav-link">
                                {link.label}
                            </Link>
                        ))}
                        <div className="header-divider" />
                        <Link href="/submit" className="btn-primary btn-sm">
                            Submit Tool
                        </Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className="header-mobile-toggle"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)}>
                    <nav
                        className="mobile-drawer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="mobile-drawer-link"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="mobile-drawer-sep" />
                        <Link
                            href="/submit"
                            className="btn-primary"
                            style={{ textAlign: "center", justifyContent: "center", width: "100%" }}
                            onClick={() => setMobileOpen(false)}
                        >
                            Submit Tool
                        </Link>
                    </nav>
                </div>
            )}
        </>
    );
}
