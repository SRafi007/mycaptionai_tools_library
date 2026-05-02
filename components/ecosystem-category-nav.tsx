"use client";

import { useEffect, useState, useRef } from "react";

interface EcoCategoryNavProps {
    categories: string[];
    brandAccent: string;
}

export default function EcoCategoryNav({ categories, brandAccent }: EcoCategoryNavProps) {
    const [active, setActive] = useState<string | null>(null);
    const [stuck, setStuck] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => setStuck(!entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    // Track scroll position to highlight active category
    useEffect(() => {
        const handleScroll = () => {
            const offsets = categories.map((cat) => {
                const el = document.getElementById(`eco-cat-${slugify(cat)}`);
                if (!el) return { cat, top: Infinity };
                return { cat, top: el.getBoundingClientRect().top };
            });
            const above = offsets.filter((o) => o.top <= 140);
            if (above.length > 0) {
                setActive(above[above.length - 1].cat);
            } else {
                setActive(null);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    const scrollTo = (cat: string) => {
        const el = document.getElementById(`eco-cat-${slugify(cat)}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            <div ref={sentinelRef} className="eco-nav-sentinel" aria-hidden="true" />
            <nav
                className={`eco-nav ${stuck ? "eco-nav--stuck" : ""}`}
                style={{ "--eco-accent": brandAccent } as React.CSSProperties}
                aria-label="Ecosystem categories"
            >
                <div className="eco-nav-inner container-main">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`eco-nav-pill ${active === cat ? "eco-nav-pill--active" : ""}`}
                            onClick={() => scrollTo(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
}

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
