"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

interface Suggestion {
    name: string;
    slug: string;
    pricing_type: string | null;
}

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
    const [query, setQuery] = useState(defaultValue);
    const [focused, setFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Keyboard shortcut: press / to focus
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Fetch suggestions with debounce
    const fetchSuggestions = useCallback((q: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
                setSelectedIdx(-1);
            } catch {
                setSuggestions([]);
            }
        }, 300);
    }, []);

    function handleChange(value: string) {
        setQuery(value);
        fetchSuggestions(value);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            setShowSuggestions(false);
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!showSuggestions) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIdx((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && selectedIdx >= 0) {
            e.preventDefault();
            setShowSuggestions(false);
            router.push(`/tools/${suggestions[selectedIdx].slug}`);
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    }

    return (
        <div style={{ position: "relative" }}>
            <form
                onSubmit={handleSubmit}
                className={`search-bar ${focused ? "search-bar-focused" : ""}`}
            >
                <svg
                    className="search-bar-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => { setFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
                    onBlur={() => { setFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search 4,266+ AI tools..."
                    className="search-bar-input"
                    autoComplete="off"
                />
                <kbd className="search-bar-kbd">/</kbd>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className="search-suggestions">
                    {suggestions.map((s, i) => (
                        <Link
                            key={s.slug}
                            href={`/tools/${s.slug}`}
                            className={`search-suggestion-item ${i === selectedIdx ? "search-suggestion-active" : ""}`}
                            onMouseEnter={() => setSelectedIdx(i)}
                            onClick={() => setShowSuggestions(false)}
                        >
                            <span className="search-suggestion-name">{s.name}</span>
                            {s.pricing_type && (
                                <span className="search-suggestion-badge">{s.pricing_type}</span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
