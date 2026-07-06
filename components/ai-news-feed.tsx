"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight } from "lucide-react";
import { AiNews } from "@/types/resources";

interface AINewsFeedProps {
  news?: AiNews[];
}

interface NormalItem {
  id: string | number;
  source: string;
  time: string;
  accent: string;
  headline: string;
  body: string;
  tags: string[];
  url: string;
}

// ---- Fallback mock data if the live database news feed is empty ----
const ITEMS = [
  {
    id: "mock-tc",
    source: "TechCrunch AI",
    time: "4d ago",
    accent: "#7DD3C0",
    headline: "Anthropic launches Claude Sonnet 5 as a cheaper way to run agents",
    body: "Stronger agentic capabilities and lower pricing position the model as an alternative to Opus, GPT-5.5, and Gemini Pro.",
    tags: ["agents", "model", "anthropic"],
    url: "#",
  },
  {
    id: "mock-ti",
    source: "The Information",
    time: "6d ago",
    accent: "#C4A6FF",
    headline: "OpenAI reshuffles enterprise team ahead of GPT-5.5 rollout",
    body: "Internal memo points to a renewed push into agentic coding tools for large enterprise customers this quarter.",
    tags: ["openai", "enterprise"],
    url: "#",
  },
  {
    id: "mock-at",
    source: "Ars Technica",
    time: "1w ago",
    accent: "#F4B266",
    headline: "Open-weight models close the gap on reasoning benchmarks",
    body: "New releases from three labs land within a few points of closed frontier models on math and code evals.",
    tags: ["open-source", "benchmarks"],
    url: "#",
  },
  {
    id: "mock-bb",
    source: "Bloomberg",
    time: "1w ago",
    accent: "#F17E92",
    headline: "AI infrastructure spending set to pass $500B in 2027",
    body: "Analysts point to compute and power constraints as the binding limits on frontier lab growth, not demand.",
    tags: ["infra", "funding"],
    url: "#",
  },
];

const ACCENT_COLORS = ["#C4A6FF", "#7DD3C0", "#F4B266", "#F17E92", "#67E8F9"];
const ROTATE_MS = 6000;

function formatRelativeTime(dateString: string): string {
  if (!dateString) return "recently";
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMins)}m ago`;
    }
    if (diffHrs < 24) {
      return `${diffHrs}h ago`;
    }
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return "recently";
  }
}

export default function AINewsFeed({ news }: AINewsFeedProps) {
  // Normalize news items from database or mock fallback
  const normalizedItems = React.useMemo<NormalItem[]>(() => {
    if (!news || news.length === 0) return ITEMS;
    return news.map((item, idx) => {
      const tags = [
        ...(item.topic_tags || []),
        ...(item.company_tags || []),
      ].slice(0, 2);

      let accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
      const sourceLower = (item.source_name || "").toLowerCase();
      if (sourceLower.includes("information")) accent = "#C4A6FF";
      else if (sourceLower.includes("techcrunch")) accent = "#7DD3C0";
      else if (sourceLower.includes("ars technica")) accent = "#F4B266";
      else if (sourceLower.includes("bloomberg")) accent = "#F17E92";

      return {
        id: item.id || idx,
        source: item.source_name || "AI News",
        time: item.published_at ? formatRelativeTime(item.published_at) : "recently",
        accent: accent,
        headline: item.title || "",
        body: item.excerpt || item.summary || "",
        tags: tags.length > 0 ? tags : ["ai", "news"],
        url: item.original_url || `/resources/ai-news/${item.slug || ""}`,
      };
    });
  }, [news]);

  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  // Swipe gesture tracking
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);

  const itemsLength = normalizedItems.length;

  const goTo = useCallback((i: number, len: number) => {
    setActive((prev) => {
      const nextIdx = ((i % len) + len) % len;
      return nextIdx;
    });
    setProgress(0);
    elapsedRef.current = 0;
    lastTimeRef.current = null;
  }, []);

  // Frame tick callback for timer progress
  useEffect(() => {
    if (paused || isDragging || itemsLength <= 1) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const tick = (t: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = t;
      }
      const delta = t - lastTimeRef.current;
      lastTimeRef.current = t;

      elapsedRef.current += delta;
      const pct = Math.min(elapsedRef.current / ROTATE_MS, 1);
      setProgress(pct);

      if (pct >= 1) {
        goTo(active + 1, itemsLength);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, paused, isDragging, itemsLength, goTo]);

  const item = normalizedItems[active] || normalizedItems[0] || ITEMS[0];
  const nextIdx = (active + 1) % itemsLength;
  const nextItem = normalizedItems[nextIdx] || normalizedItems[0] || ITEMS[0];

  const formatIndex = (idx: number) => String(idx + 1).padStart(2, "0");
  const totalItemsFormatted = String(itemsLength).padStart(2, "0");

  // Mouse gestures
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("svg")) return;
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const diffX = e.clientX - dragStart.x;
    setDragOffset({ x: diffX, y: 0 });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);

    const threshold = 120;
    if (dragOffset.x > threshold) {
      goTo(active - 1, itemsLength);
    } else if (dragOffset.x < -threshold) {
      goTo(active + 1, itemsLength);
    }
    setDragOffset({ x: 0, y: 0 });
    setPaused(false);
  };

  // Touch gestures for mobile layout
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("svg")) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - dragStart.x;
    setDragOffset({ x: diffX, y: 0 });
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);

    const threshold = 90;
    if (dragOffset.x > threshold) {
      goTo(active - 1, itemsLength);
    } else if (dragOffset.x < -threshold) {
      goTo(active + 1, itemsLength);
    }
    setDragOffset({ x: 0, y: 0 });
    setPaused(false);
  };

  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  const cardStyle = isDragging
    ? {
        transform: `translateX(${dragOffset.x}px) rotate(${dragOffset.x * 0.04}deg)`,
        transition: "none",
      }
    : {
        transform: "translateX(0px) rotate(0deg)",
        transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
      };

  return (
    <div className="ai-wire-container">
      {/* Top indicator bar */}
      <div className="ai-wire-header">
        <span className="ai-wire-header-title">AI Wire</span>
        <span className="ai-wire-header-hint">drag to skip</span>
      </div>

      {/* Cards stack */}
      <div className="ai-wire-stack">
        <div className="ai-wire-card-wrapper">
          {/* Active front card */}
          <article
            key={active}
            className="ai-wire-card"
            style={cardStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              handleMouseUp();
              setPaused(false);
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setPaused(true)}
          >
            {/* Top row: progress circle */}
            <div className="ai-wire-card-top">
              <span className="ai-wire-card-index">
                N°{formatIndex(active)} / {totalItemsFormatted}
              </span>
              <svg className="ai-wire-progress-circle" viewBox="0 0 24 24">
                <circle className="ai-wire-progress-bg" cx="12" cy="12" r={radius} />
                <circle
                  className="ai-wire-progress-bar"
                  cx="12"
                  cy="12"
                  r={radius}
                  stroke={item.accent}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
            </div>

            {/* Source meta */}
            <div className="ai-wire-meta">
              <span>{item.source}</span>
              <span style={{ opacity: 0.65 }}> &ndash; {item.time}</span>
            </div>

            {/* Headline */}
            <h3 className="ai-wire-headline" style={{ color: "var(--text-primary)" }}>
              {item.headline}
            </h3>

            {/* Snippet body */}
            <p className="ai-wire-body">{item.body}</p>

            {/* Footer tags & link */}
            <div className="ai-wire-footer">
              <div className="ai-wire-tags">
                {item.tags.map((tag) => (
                  <span key={tag} className="ai-wire-tag">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ai-wire-read"
                style={{ color: item.accent }}
              >
                <span>Read</span>
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </a>
            </div>
          </article>

          {/* Peek at the next card behind the main card */}
          {itemsLength > 1 && (
            <div
              className="ai-wire-card-peek"
              style={{
                borderColor: nextItem.accent + "40",
                borderWidth: "1px",
              }}
            >
              <div className="ai-wire-peek-content">
                <span
                  className="ai-wire-peek-dot"
                  style={{ background: nextItem.accent }}
                />
                <span>
                  {nextItem.source} &middot; up next
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav back/next buttons */}
      {itemsLength > 1 && (
        <div className="ai-wire-nav">
          <button
            onClick={() => goTo(active - 1, itemsLength)}
            className="ai-wire-btn"
            aria-label="Previous card"
          >
            <span>back</span>
          </button>
          <button
            onClick={() => goTo(active + 1, itemsLength)}
            className="ai-wire-btn active-btn"
            style={{
              borderColor: item.accent + "66",
            }}
            aria-label="Next card"
          >
            <span>next</span>
            <ArrowUpRight size={13} strokeWidth={2.5} style={{ color: item.accent }} />
          </button>
        </div>
      )}
    </div>
  );
}
