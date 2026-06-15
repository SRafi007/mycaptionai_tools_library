"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="page-header" style={{ position: "relative" }} ref={containerRef}>
      <h1 
        className="page-title" 
        style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "10px", 
          margin: 0, 
          position: "relative" 
        }}
      >
        <span>{title}</span>
        <button
          type="button"
          className={`page-info-trigger-btn ${isOpen ? "active" : ""}`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Show page description"
          aria-expanded={isOpen}
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: isOpen ? "var(--accent)" : "var(--text-muted)",
            transition: "all 0.25s ease",
            borderRadius: "50%",
            outline: "none",
          }}
        >
          <Info 
            size={24}
            style={{ 
              verticalAlign: "middle",
              display: "inline-block",
            }}
          />
        </button>

        {isOpen && (
          <div className="page-subtitle-creative-popover" role="tooltip">
            <div className="popover-decor-bar"></div>
            <div className="popover-content">
              <span className="popover-icon">💡</span>
              <p className="popover-text">{subtitle}</p>
            </div>
            <button 
              type="button" 
              className="popover-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
      </h1>
    </div>
  );
}
