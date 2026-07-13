"use client";

import Link from "next/link";
import { Play, Music, Sparkles, Heart, MessageSquare, Share2 } from "lucide-react";

export default function HomeClipsDoor() {
  return (
    <section className="clips-door-section">
      {/* Inline styles to bypass Next.js Turbopack stylesheet hot-reload caching bugs */}
      <style dangerouslySetInnerHTML={{ __html: `
        .clips-door-section {
          background-color: var(--bg-primary);
          padding: 40px 0;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .clips-door-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .clips-portal {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 680px;
          text-decoration: none;
          padding: clamp(24px, 4vw, 36px) clamp(16px, 4vw, 32px) 0;
          border-radius: 24px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-default);
          overflow: hidden;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .clips-portal:hover {
          border-color: var(--border-hover);
          box-shadow: var(--shadow-soft);
        }

        .clips-portal:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 4px;
        }

        .clips-portal__title {
          position: relative;
          z-index: 2;
          margin: 0;
          text-align: center;
          font-family: var(--font-space-grotesk, 'Space Grotesk', sans-serif);
          font-weight: 700;
          font-size: clamp(22px, 4vw, 32px);
          line-height: 1.1;
          color: var(--white);
          letter-spacing: -0.02em;
        }

        .clips-portal__title-accent {
          display: inline-block;
          color: var(--brand);
        }

        .clips-portal__sub {
          position: relative;
          z-index: 2;
          margin: 8px 0 16px;
          text-align: center;
          color: var(--slate-500);
          font-size: clamp(13px, 2vw, 14px);
          max-width: 34ch;
        }

        .clips-portal__cta {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-space-grotesk, 'Space Grotesk', sans-serif);
          font-weight: 600;
          font-size: 13px;
          color: var(--text-primary);
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          padding: 8px 16px;
          border-radius: 999px;
          margin-bottom: clamp(18px, 4vw, 24px);
          transition: border-color var(--transition), background var(--transition);
        }

        .clips-portal__cta-arrow {
          display: flex;
          transition: transform var(--transition);
        }

        .clips-portal:hover .clips-portal__cta {
          border-color: var(--brand);
          background: var(--bg-surface-hover);
        }

        .clips-portal:hover .clips-portal__cta-arrow {
          transform: translateX(3px);
        }

        .clips-portal__phones {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
        }

        .clips-portal__phone {
          position: relative;
          transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .clips-portal__phone--left {
          transform: rotate(-13deg) translate(14px, 6px);
          z-index: 1;
        }

        .clips-portal__phone--right {
          transform: rotate(13deg) translate(-14px, 6px);
          z-index: 1;
        }

        .clips-portal__phone--center {
          transform: translateY(-14px) scale(1.04);
          z-index: 2;
        }

        .clips-portal:hover .clips-portal__phone--left {
          transform: rotate(-19deg) translate(20px, 2px);
        }

        .clips-portal:hover .clips-portal__phone--right {
          transform: rotate(19deg) translate(-20px, 2px);
        }

        .clips-portal:hover .clips-portal__phone--center {
          transform: translateY(-20px) scale(1.06);
        }

        .clips-portal__float {
          width: clamp(70px, 16vw, 100px);
          aspect-ratio: 9/19.5;
          animation: clipsFloat 6s ease-in-out infinite;
        }

        .clips-portal__phone--center .clips-portal__float {
          width: clamp(80px, 18vw, 112px);
        }

        .clips-portal__phone--left .clips-portal__float {
          animation-delay: 0.15s;
        }

        .clips-portal__phone--right .clips-portal__float {
          animation-delay: 0.3s;
        }

        .clips-portal__frame {
          width: 100%;
          height: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          padding: 4px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .clips-portal__notch {
          position: absolute;
          top: 7px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 3px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.15);
          z-index: 3;
        }

        .clips-portal__screen {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-surface);
        }

        .clips-portal__media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 2;
        }

        .clips-portal__media-fallback {
          display: flex;
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .clips-portal__floor {
          width: 100%;
          height: 36px;
        }

        @keyframes clipsFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* Mockup Sound Screen (Left Phone) */
        .phone-mockup-sound {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 8px;
          background: #0d0e12;
          font-family: inherit;
          text-align: left;
        }
        
        .sound-header {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.04);
          padding: 4px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          margin-bottom: 6px;
        }

        .sound-icon-box {
          background: var(--brand);
          width: 14px;
          height: 14px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          flex-shrink: 0;
        }

        .sound-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sound-title {
          font-size: 6px;
          font-weight: 700;
          color: var(--white);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .sound-author {
          font-size: 5px;
          color: var(--slate-500);
        }

        .sound-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          flex-grow: 1;
        }

        .sound-grid-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }

        .grid-item-view {
          position: absolute;
          bottom: 2px;
          left: 2px;
          font-size: 4.5px;
          color: var(--slate-300);
          font-weight: 500;
        }

        .sound-button {
          background: var(--danger);
          color: var(--white);
          font-size: 6px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 4px;
          border-radius: 12px;
          margin-top: 6px;
          text-transform: uppercase;
        }

        /* Mockup Editor Screen (Center Phone) */
        .phone-mockup-editor {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #090a0d;
        }

        .editor-preview {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: rgba(255, 255, 255, 0.01);
        }

        .editor-glow-icon {
          color: var(--highlight-accent);
          opacity: 0.35;
          animation: editorGlow 4s infinite alternate;
        }

        @keyframes editorGlow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px var(--highlight-accent)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 8px var(--highlight-accent)); }
        }

        .editor-preview-play {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(99, 102, 241, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .editor-timeline {
          background: #111216;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
          min-height: 90px;
        }

        .timeline-block {
          font-size: 5.5px;
          font-weight: 600;
          padding: 3px 6px;
          border-radius: 3px;
          color: #000000;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .block-yellow { background-color: #f59e0b; }
        .block-pink { background-color: #f87171; }
        .block-cyan { background-color: #06b6d4; }

        /* Mockup Player Screen (Right Phone) */
        .phone-mockup-player {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 8px;
          position: relative;
          background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%);
          text-align: left;
        }

        .player-sidebar {
          position: absolute;
          right: 4px;
          bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        .sidebar-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }

        .sidebar-action span {
          font-size: 4px;
          font-weight: 500;
          color: var(--slate-300);
        }

        .player-bottom {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-right: 14px;
        }

        .player-user {
          font-size: 6px;
          font-weight: 700;
          color: var(--white);
        }

        .player-desc {
          font-size: 5px;
          color: var(--slate-300);
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 520px) {
          .clips-portal__phone--left {
            transform: rotate(-8deg) translate(22px, 6px);
          }
          .clips-portal__phone--right {
            transform: rotate(8deg) translate(-22px, 6px);
          }
          .clips-portal__phone--center {
            transform: translateY(-10px) scale(1.02);
          }
          
          .clips-portal:hover .clips-portal__phone--left {
            transform: rotate(-11deg) translate(16px, 4px);
          }
          
          .clips-portal:hover .clips-portal__phone--right {
            transform: rotate(11deg) translate(-16px, 4px);
          }

          /* Scale text sizes down further inside compressed small phone views */
          .sound-title { font-size: 4px; }
          .sound-author { font-size: 3.5px; }
          .grid-item-view { font-size: 3px; }
          .sound-button { font-size: 4px; padding: 2px; }
          .timeline-block { font-size: 4px; padding: 2px 4px; }
          .player-user { font-size: 4px; }
          .player-desc { font-size: 3.5px; }
          .sidebar-action span { font-size: 3px; }
        }
      `}} />

      <div className="container-main clips-door-container">
        
        <Link className="clips-portal" href="/ai-clips" aria-label="Open the AI Clips feed">
          
          <h2 className="clips-portal__title">
            Step inside <span className="clips-portal__title-accent">AI Clips</span>
          </h2>
          
          <p className="clips-portal__sub">Short videos, entirely made by AI.</p>
          
          <span className="clips-portal__cta">
            Open the feed
            <span className="clips-portal__cta-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </span>
          </span>

          <div className="clips-portal__phones">

            {/* Left Phone */}
            <div className="clips-portal__phone clips-portal__phone--left">
              <div className="clips-portal__float">
                <div className="clips-portal__frame">
                  <span className="clips-portal__notch"></span>
                  <div className="clips-portal__screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="clips-portal__media" 
                      src="/image/clip-left.gif" 
                      alt="AI clip preview left"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="clips-portal__media-fallback">
                      <div className="phone-mockup-sound">
                        <div className="sound-header">
                          <div className="sound-icon-box">
                            <Music size={8} />
                          </div>
                          <div className="sound-meta">
                            <div className="sound-title">Talk About Love</div>
                            <div className="sound-author">Zara Larsson</div>
                          </div>
                        </div>
                        <div className="sound-grid">
                          <div className="sound-grid-item">
                            <div className="grid-item-view">1.2M</div>
                          </div>
                          <div className="sound-grid-item">
                            <div className="grid-item-view">940K</div>
                          </div>
                          <div className="sound-grid-item">
                            <div className="grid-item-view">850K</div>
                          </div>
                          <div className="sound-grid-item">
                            <div className="grid-item-view">520K</div>
                          </div>
                        </div>
                        <div className="sound-button">
                          <Play size={6} fill="currentColor" /> Use Sound
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Phone */}
            <div className="clips-portal__phone clips-portal__phone--center">
              <div className="clips-portal__float">
                <div className="clips-portal__frame">
                  <span className="clips-portal__notch"></span>
                  <div className="clips-portal__screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="clips-portal__media" 
                      src="/image/clip-mid.gif" 
                      alt="AI clip preview center"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="clips-portal__media-fallback">
                      <div className="phone-mockup-editor">
                        <div className="editor-preview">
                          <Sparkles size={14} className="editor-glow-icon" />
                          <span className="editor-preview-play">
                            <Play size={10} fill="currentColor" />
                          </span>
                        </div>
                        <div className="editor-timeline">
                          <div className="timeline-block block-yellow">First hydrate</div>
                          <div className="timeline-block block-pink">Next, rose oil</div>
                          <div className="timeline-block block-cyan">Grab jade roller</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Phone */}
            <div className="clips-portal__phone clips-portal__phone--right">
              <div className="clips-portal__float">
                <div className="clips-portal__frame">
                  <span className="clips-portal__notch"></span>
                  <div className="clips-portal__screen">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="clips-portal__media" 
                      src="/image/clip-right.gif" 
                      alt="AI clip preview right"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="clips-portal__media-fallback">
                      <div className="phone-mockup-player">
                        <div className="player-sidebar">
                          <div className="sidebar-action">
                            <Heart size={8} fill="red" color="red" />
                            <span>2.1M</span>
                          </div>
                          <div className="sidebar-action">
                            <MessageSquare size={8} />
                            <span>12K</span>
                          </div>
                          <div className="sidebar-action">
                            <Share2 size={8} />
                            <span>Share</span>
                          </div>
                        </div>
                        <div className="player-bottom">
                          <div className="player-user">@samantha_day</div>
                          <div className="player-desc">The glow up is real #selfcare</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="clips-portal__floor"></div>

        </Link>
        
      </div>
    </section>
  );
}
