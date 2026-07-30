"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth/hooks";
import SignInModal from "@/components/auth/sign-in-modal";
import UserAvatarMenu from "@/components/auth/user-avatar-menu";

const navLinks = [
    { href: "/ai-tools", label: "AI Tools" },
    { href: "/our-tools", label: "Our Tools" },
    { href: "/ai-clips", label: "AI Clips" },
    { href: "/prompts", label: "Prompts" },
    { href: "/playbooks", label: "Playbooks" },
    { href: "/ecosystems", label: "Ecosystems" },
    { href: "/resources", label: "Resources" },
    { href: "/blog", label: "Blog" },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState(false);
    const { user, loading, signOut } = useAuth();

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
                        
                        {/* Auth Elements */}
                        {loading ? (
                            <div className="header-auth-skeleton" />
                        ) : user ? (
                            <UserAvatarMenu />
                        ) : (
                            <button 
                                onClick={() => setSignInOpen(true)} 
                                className="header-nav-link btn-signin-nav"
                            >
                                Sign In
                            </button>
                        )}

                        <Link href="/submit" className="btn-tag-style btn-primary-tag">
                            <span className="btn-tag-icon-box"><Plus size={13} /></span>
                            <span>Submit Tool</span>
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
                        
                        {/* Mobile Auth */}
                        {!loading && (
                            <>
                                {user ? (
                                    <button 
                                        onClick={async () => {
                                            setMobileOpen(false);
                                            await signOut();
                                        }}
                                        className="mobile-drawer-link mobile-btn-signout"
                                        style={{ textAlign: "left", width: "100%", cursor: "pointer" }}
                                    >
                                        Sign Out ({user.email?.split("@")[0]})
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setMobileOpen(false);
                                            setSignInOpen(true);
                                        }}
                                        className="mobile-drawer-link mobile-btn-signin"
                                        style={{ textAlign: "left", width: "100%", cursor: "pointer" }}
                                    >
                                        Sign In
                                    </button>
                                )}
                                <hr className="mobile-drawer-sep" />
                            </>
                        )}

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

            {/* Sign In Modal */}
            <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
        </>
    );
}
