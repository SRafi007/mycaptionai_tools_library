"use client";

import { useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
  variant?: "primary" | "outline" | "icon";
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CopyButton({
  textToCopy,
  variant = "primary",
  label,
  className = "",
  style,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const copyIcon = copied ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        onClick={handleCopy}
        className={`prompt-copy-icon-btn ${copied ? "copied" : ""} ${className}`}
        title={copied ? "Copied!" : "Copy prompt"}
        style={style}
      >
        {copyIcon}
        <span>{copied ? "Copied!" : (label || "Copy")}</span>
      </button>
    );
  }

  const btnClass = variant === "outline" ? "btn-outline" : "btn-primary";

  return (
    <button
      onClick={handleCopy}
      className={`${btnClass} ${copied ? "btn-success" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.2s ease",
        ...style,
      }}
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          {copied ? "Copied!" : "Copy to Clipboard"}
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {label || "Copy to Clipboard"}
        </>
      )}
    </button>
  );
}
