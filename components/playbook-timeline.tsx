"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  AudioLines, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  BarChart2, 
  HelpCircle, 
  ChevronDown, 
  Check, 
  Copy 
} from "lucide-react";
import { PlaybookWithDetails } from "@/types/playbook";

interface PlaybookTimelineProps {
  playbook: PlaybookWithDetails;
}

const ACCENT_COLORS = ["var(--pb-violet)", "var(--pb-cyan)", "var(--pb-amber)", "var(--pb-rose)"];

const getStepIcon = (kind?: string | null) => {
  if (!kind) return <HelpCircle size={16} />;
  switch (kind.toLowerCase()) {
    case "llm":
      return <MessageSquare size={16} />;
    case "audio":
      return <AudioLines size={16} />;
    case "video":
      return <Video size={16} />;
    case "edit":
      return <FileText size={16} />;
    case "image":
      return <ImageIcon size={16} />;
    case "schedule":
      return <Calendar size={16} />;
    case "chart":
      return <BarChart2 size={16} />;
    default:
      return <HelpCircle size={16} />;
  }
};

export default function PlaybookTimeline({ playbook }: PlaybookTimelineProps) {
  const steps = playbook.tools;
  const totalStages = steps.length;

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0]); // Expand first step by default
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const spyObserverRef = useRef<IntersectionObserver | null>(null);
  const revealObserverRef = useRef<IntersectionObserver | null>(null);

  // Toggle stage accordion
  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Scroll to targeted stage
  const scrollToStage = (idx: number) => {
    const el = document.getElementById(`pb-stage-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Clipboard copy helper
  const handleCopy = (idx: number, promptText?: string | null) => {
    const textToCopy = promptText || "No prompt details provided.";
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedIdx(idx);
          setTimeout(() => setCopiedIdx(null), 1500);
        })
        .catch((err) => console.error("Failed to copy text: ", err));
    }
  };

  // Setup Observers for scroll-spy and entrance reveal animation
  useEffect(() => {
    const stepElements = document.querySelectorAll(".pb-step");
    if (stepElements.length === 0) return;

    // 1. Scroll-spy to highlight active rail navigation link
    spyObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-idx"));
            setActiveIdx(idx);
          }
        });
      },
      {
        rootMargin: "-42% 0px -42% 0px", // observe near vertical center
        threshold: 0,
      }
    );
    stepElements.forEach((el) => spyObserverRef.current?.observe(el));

    // 2. Scroll-reveal entrance animation
    revealObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pb-revealed");
            revealObserverRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -8% 0px",
      }
    );
    stepElements.forEach((el) => revealObserverRef.current?.observe(el));

    return () => {
      spyObserverRef.current?.disconnect();
      revealObserverRef.current?.disconnect();
    };
  }, [steps.length]);

  return (
    <div className="playbook-layout">
      {/* Timeline Steps Column */}
      <div className="playbook-timeline-col">
        <div className="pb-timeline-wrapper">
          {/* Vertical Spine Track */}
          <div className="pb-spine" />
          
          {/* Animated Spine Glow Traveler */}
          <div className="pb-spine-glow" />

          {/* Steps List */}
          <div className="pb-steps-list">
            {steps.map((tool, idx) => {
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const isExpanded = expandedIndices.includes(idx);
              const isCopied = copiedIdx === idx;
              const hasVisualIcon = Boolean(tool.icon_url || tool.image_url);

              // Split description or fallback to structured editorial content
              const displayTitle = tool.step_title || `Use ${tool.name}`;
              const displayDesc = tool.step_description || "Add this tool to your pipeline workflow.";
              const promptContent = tool.prompt || "Add prompt instructions here.";

              return (
                <div
                  key={`${tool.id}-${idx}`}
                  id={`pb-stage-${idx}`}
                  className="pb-step"
                  data-idx={idx}
                  style={{ "--pb-accent": accent } as React.CSSProperties}
                >
                  {/* Spine Marker Track */}
                  <div className="pb-track">
                    <button
                      className="pb-marker"
                      onClick={() => toggleExpand(idx)}
                      aria-label={`Toggle stage ${idx + 1}`}
                    >
                      <span className="pb-marker-index">{idx + 1}</span>
                      {getStepIcon(tool.step_kind)}
                    </button>
                  </div>

                  {/* Accordion Card */}
                  <div className="pb-card-wrap">
                    <div className={`pb-card ${isExpanded ? "pb-expanded" : ""}`}>
                      {/* Card Header Toggle */}
                      <header
                        className="pb-card-head"
                        onClick={() => toggleExpand(idx)}
                      >
                        <div className="pb-tool-icon">
                          {getStepIcon(tool.step_kind)}
                        </div>
                        <h3 className="pb-tool-name">
                          <Link href={`/tools/${tool.slug}`} onClick={(e) => e.stopPropagation()}>
                            {tool.name}
                          </Link>
                        </h3>
                        <ChevronDown className="pb-chev" />
                      </header>

                      {/* Card Visible Body */}
                      <div className="pb-card-body">
                        <h3>{displayTitle}</h3>
                        <p>{displayDesc}</p>
                        
                        <button
                          className="pb-reveal-btn"
                          onClick={() => toggleExpand(idx)}
                        >
                          <span>{isExpanded ? "Hide prompt" : "Open prompt"}</span>
                          <ChevronDown />
                        </button>
                      </div>

                      {/* Expandable Prompt Terminal Console */}
                      <div className="pb-prompt-wrap">
                        <div className="pb-prompt-inner">
                          <div className="pb-terminal">
                            <div className="pb-terminal-bar">
                              <div className="pb-terminal-dots">
                                <span />
                                <span />
                                <span />
                              </div>
                              <div className="pb-terminal-file">
                                {tool.file_name || "prompt.txt"}
                              </div>
                              <button
                                className={`pb-copy-btn ${isCopied ? "pb-copied" : ""}`}
                                onClick={() => handleCopy(idx, promptContent)}
                              >
                                {isCopied ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <pre>{promptContent}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Desktop Rail & Mobile Horizontal Bar */}
      {totalStages > 1 && (
        <aside className="playbook-nav-rail">
          <div className="playbook-nav-rail-label">Jump to stage</div>
          <nav className="playbook-nav-list" aria-label="Playbook stage navigation">
            {steps.map((tool, idx) => {
              const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              const isActive = activeIdx === idx;
              const title = tool.step_title || `Use ${tool.name}`;

              return (
                <button
                  key={`nav-${tool.id}-${idx}`}
                  className={`playbook-nav-item ${isActive ? "pb-active" : ""}`}
                  style={{ "--pb-accent": accent } as React.CSSProperties}
                  onClick={() => scrollToStage(idx)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="playbook-nav-num">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="playbook-nav-icon">
                    {getStepIcon(tool.step_kind)}
                  </span>
                  <span className="playbook-nav-text">{title}</span>
                </button>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
}
