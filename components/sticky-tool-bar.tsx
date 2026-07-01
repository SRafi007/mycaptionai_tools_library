"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface StickyToolBarProps {
    name: string;
    iconUrl: string | null;
    visitUrl: string | undefined;
    visitRel?: string;
}

export default function StickyToolBar({
    name,
    iconUrl,
    visitUrl,
    visitRel = "noopener noreferrer",
}: StickyToolBarProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hero = document.getElementById("tool-hero-section");
        if (!hero) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShow(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: "-60px 0px 0px 0px" }
        );

        observer.observe(hero);
        return () => {
            observer.disconnect();
        };
    }, []);

    function getInitials(toolName: string): string {
        const parts = toolName
            .split(/\s+/)
            .map((part) => part.trim())
            .filter(Boolean);

        if (parts.length === 0) return "?";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    if (!visitUrl) return null;

    return (
        <div className={`tool-sticky-bar ${show ? "show" : ""}`}>
            <div className="left">
                <div className="mini-icon">
                    {iconUrl ? (
                        <Image
                            src={iconUrl}
                            alt={`${name} icon`}
                            width={22}
                            height={22}
                            unoptimized
                            className="object-cover rounded-xs"
                        />
                    ) : (
                        <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--brand)" }}>
                            {getInitials(name)}
                        </span>
                    )}
                </div>
                <span className="name">{name}</span>
            </div>
            <a
                href={visitUrl}
                target="_blank"
                rel={visitRel}
                className="btn-primary btn-sm"
                style={{ padding: "8px 16px", fontSize: "13px" }}
            >
                Visit Tool →
            </a>
        </div>
    );
}
