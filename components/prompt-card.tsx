"use client";

import { useState } from "react";
import Link from "next/link";
import { Prompt } from "@/types/prompt";

interface PromptCardProps {
  prompt: Prompt;
}

const promptTypeIcons: Record<string, string> = {
  chat: "💬",
  image: "🎨",
  video: "🎬",
  code: "💻",
  seo: "🔍",
  business: "💼",
  marketing: "📈",
  caption: "📝",
  agent: "🤖",
  workflow: "⚙️",
  other: "✨",
};

export default function PromptCard({ prompt }: PromptCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract YouTube video ID
  const getYoutubeVideoId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(prompt.youtube_url);
  const showVideo = isHovered && videoId;
  const hasValidCover = prompt.cover_url && !imageError;
  const showFallback = !hasValidCover && !videoId;

  return (
    <div
      className="tool-card prompt-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/prompts/${prompt.slug}`} className="tool-card-content" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Media Header (Always present for consistent grid) */}
        <div
          className="tool-card-media prompt-card-media"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            backgroundColor: "var(--border-color)",
            overflow: "hidden",
            borderTopLeftRadius: "15px",
            borderTopRightRadius: "15px",
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
            marginBottom: "1rem",
          }}
        >
          {/* Show cover image by default, or if no video is hovered */}
          {hasValidCover && !showVideo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={prompt.cover_url!}
              alt={prompt.title}
              onError={() => setImageError(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          
          {/* Show Video if hovered, or if it's the only media available */}
          {(showVideo || (!hasValidCover && videoId)) && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=${
                isHovered ? 1 : 0
              }&mute=1&controls=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0 }}
            ></iframe>
          )}

          {/* Fallback Text Cover */}
          {showFallback && (
            <div
              className="prompt-card-fallback-cover"
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #111827 0%, #1e1b4b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                textAlign: "center",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1.25rem",
                lineHeight: 1.3,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {prompt.title}
            </div>
          )}
        </div>

        <div className="prompt-card-body">
          <div className="tool-card-header">
            <h3 className="tool-card-title">
              <span className="prompt-card-type-icon">
                {promptTypeIcons[prompt.prompt_type] || "✨"}
              </span>
              <span>{prompt.title}</span>
            </h3>
          </div>

          {prompt.description && (
            <p className="tool-card-description">{prompt.description}</p>
          )}

          <div className="tool-card-meta">
            {/* Tags */}
            <div className="prompt-card-tags">
              {prompt.tool_tags && prompt.tool_tags.length > 0 && (
                <span className="prompt-card-tag prompt-card-tag-yellow">{prompt.tool_tags[0]}</span>
              )}
              {prompt.tags && prompt.tags.length > 0 && (
                <span className="prompt-card-tag">#{prompt.tags[0]}</span>
              )}
            </div>

            <div className="prompt-card-stats">
              <span title="Copy Count">
                📋 {prompt.copy_count}
              </span>
              <span title="View Count">
                👁️ {prompt.view_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
