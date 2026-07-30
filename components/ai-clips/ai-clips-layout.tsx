"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Mic,
    MessageSquare,
    Share2,
    Heart,
    VolumeX,
    Volume2,
    Play,
    Pause,
    Sparkles,
    Globe,
    ChevronLeft,
    ChevronRight,
    Tv,
    Languages,
    HelpCircle,
    Info,
    X
} from "lucide-react";
import { AIClip, AIClipsResponse } from "@/types/ai-clip";
import YoutubeReelPlayer from "./youtube-reel-player";
import AIClipsSkeleton from "./ai-clips-skeleton";

// Dynamic Lucide icon selection based on clip tags and category
function getClipIcon(clip: AIClip) {
    const category = (clip.content_category || "").toLowerCase();
    const tags = clip.tags.map(t => t.toLowerCase());

    if (category === "news" || tags.includes("ai-news")) {
        return <Tv size={46} strokeWidth={1.5} className="opacity-80" />;
    }
    if (category === "tool_demo" || tags.includes("ai-tools") || tags.includes("productivity")) {
        return <Sparkles size={46} strokeWidth={1.5} className="opacity-80" />;
    }
    if (tags.includes("podcast") || tags.includes("voice") || tags.includes("audio")) {
        return <Mic size={46} strokeWidth={1.5} className="opacity-80" />;
    }
    if (tags.includes("benchmark") || tags.includes("vs")) {
        return <Globe size={46} strokeWidth={1.5} className="opacity-80" />;
    }
    if (clip.language_code !== "en" || tags.includes("dubbing")) {
        return <Languages size={46} strokeWidth={1.5} className="opacity-80" />;
    }

    // Fallback default
    return <Play size={46} strokeWidth={1.5} className="opacity-80" />;
}

// Generate dynamic word-by-word caption lines from description / summary / hook text
function getCaptionLines(clip: AIClip): string[] {
    const text = clip.hook_text || clip.summary || clip.description || clip.title || "";
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return ["Amazing AI short by MyCaptionAI"];

    // Split by punctuation for natural line pausing
    const clauses = cleanText.split(/(?<=[.,!?;—]|\s—\s)/);
    const lines: string[] = [];

    for (const clause of clauses) {
        const trimmed = clause.trim();
        if (!trimmed) continue;

        const words = trimmed.split(' ');
        if (words.length > 7) {
            // Break down long clauses into 4-5 word segments
            for (let i = 0; i < words.length; i += 5) {
                const chunk = words.slice(i, i + 5).join(' ');
                if (chunk) lines.push(chunk);
            }
        } else {
            lines.push(trimmed);
        }
    }

    return lines.slice(0, 6);
}

// Format subscriber counts based on video view count
function formatSubs(views: number): string {
    if (!views) return "100K";
    const calculated = Math.max(1200, Math.floor(views / 12));
    if (calculated >= 1000000) {
        return (calculated / 1000000).toFixed(2) + "M";
    }
    if (calculated >= 1000) {
        return (calculated / 1000).toFixed(1) + "K";
    }
    return calculated.toString();
}

export default function AIClipsLayout() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [clips, setClips] = useState<AIClip[]>([]);
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [seed, setSeed] = useState<number | null>(null);

    // Audio & playback controls
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [infoOpen, setInfoOpen] = useState<boolean>(false);

    // Time sync for captions and bars
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);

    // Persistence lists
    const [likedClips, setLikedClips] = useState<Set<string>>(new Set());
    const [shareTooltip, setShareTooltip] = useState<string | null>(null);

    // 1. Initialize Seed & Mute States on Mount
    useEffect(() => {
        // Prevent body scrolling on desktop
        document.body.classList.add("clips-page-body");

        // Generate or load stable session seed for anonymous shuffling
        let sessionSeed = sessionStorage.getItem("mycaption_clips_seed");
        if (!sessionSeed) {
            sessionSeed = String(Math.floor(Math.random() * 1000000));
            sessionStorage.setItem("mycaption_clips_seed", sessionSeed);
        }
        setSeed(parseInt(sessionSeed, 10));

        // Load liked clips from localStorage
        const savedLikes = localStorage.getItem("mycaption_liked_clips");
        if (savedLikes) {
            try {
                setLikedClips(new Set(JSON.parse(savedLikes)));
            } catch (e) {
                // Ignore parsing errors
            }
        }

        // Check if there was a saved mute preference
        const savedMute = localStorage.getItem("mycaption_clips_muted");
        if (savedMute !== null) {
            setIsMuted(savedMute === "true");
        }

        return () => {
            document.body.classList.remove("clips-page-body");
        };
    }, []);

    // Close details overlay on active video change
    useEffect(() => {
        setInfoOpen(false);
    }, [currentIdx]);

    // 2. Fetch clips when seed is ready
    useEffect(() => {
        if (seed === null) return;

        const loadInitialClips = async () => {
            setIsLoading(true);
            try {
                // Check if specific clip was requested in URL parameter
                const clipParam = searchParams.get("clip");
                let url = `/api/ai-clips?page=1&seed=${seed}&limit=9`;
                if (clipParam) {
                    url += `&clipId=${clipParam}`;
                }

                // Fallback to our route api
                const res = await fetch(url);
                if (res.ok) {
                    const data: AIClipsResponse = await res.json();
                    setClips(data.clips);
                    setHasMore(data.hasMore);

                    // If a clip was requested in the URL, find its index
                    if (clipParam && data.clips.length > 0) {
                        const targetIndex = data.clips.findIndex(c => c.id === clipParam || c.youtube_video_id === clipParam);
                        if (targetIndex !== -1) {
                            setCurrentIdx(targetIndex);
                        }
                    }
                }
            } catch (err) {
                console.error("Error loading initial clips:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialClips();
    }, [seed]);

    // 3. Infinite scroll pagination: fetch next page when near the end
    useEffect(() => {
        if (clips.length === 0 || !hasMore || isLoading || seed === null) return;

        // Fetch when user is 2 clips away from the end of the current list
        if (currentIdx >= clips.length - 2) {
            const loadNextPage = async () => {
                const nextPage = page + 1;
                try {
                    const res = await fetch(`/api/ai-clips?page=${nextPage}&seed=${seed}&limit=9`);
                    if (res.ok) {
                        const data: AIClipsResponse = await res.json();
                        setClips(prev => {
                            // Filter duplicates just in case
                            const existingIds = new Set(prev.map(c => c.id));
                            const uniqueNew = data.clips.filter(c => !existingIds.has(c.id));
                            return [...prev, ...uniqueNew];
                        });
                        setPage(nextPage);
                        setHasMore(data.hasMore);
                    }
                } catch (err) {
                    console.error("Error loading next page:", err);
                }
            };
            loadNextPage();
        }
    }, [currentIdx, clips.length, hasMore, page, seed]);

    const resetVideoProgress = useCallback(() => {
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(true);
    }, []);

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        setClips([]);
        const newSeed = Math.floor(Math.random() * 1000000);
        sessionStorage.setItem("mycaption_clips_seed", String(newSeed));
        setSeed(newSeed);
        setPage(1);
        setCurrentIdx(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(true);
    }, []);

    const loadMoreClips = useCallback(async () => {
        if (!hasMore || isLoading || seed === null) return;
        setIsLoading(true);
        const nextPage = page + 1;
        try {
            const res = await fetch(`/api/ai-clips?page=${nextPage}&seed=${seed}&limit=9`);
            if (res.ok) {
                const data: AIClipsResponse = await res.json();
                setClips(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueNew = data.clips.filter(c => !existingIds.has(c.id));
                    return [...prev, ...uniqueNew];
                });
                setPage(nextPage);
                setHasMore(data.hasMore);
            }
        } catch (err) {
            console.error("Error loading more clips:", err);
        } finally {
            setIsLoading(false);
        }
    }, [hasMore, isLoading, page, seed]);

    const navigatePrev = useCallback(() => {
        if (clips.length === 0) return;
        setCurrentIdx(prev => (prev - 1 + clips.length) % clips.length);
        resetVideoProgress();
    }, [clips.length, resetVideoProgress]);

    const navigateNext = useCallback(() => {
        if (clips.length === 0) return;
        if (currentIdx === clips.length - 1) {
            handleRefresh();
        } else {
            setCurrentIdx(prev => prev + 1);
            resetVideoProgress();
        }
    }, [clips.length, currentIdx, handleRefresh, resetVideoProgress]);

    // Touch swipe gestures for mobile viewport navigation
    const touchStartY = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);
    const hasSwiped = useRef<boolean>(false);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartY.current = e.targetTouches[0].clientY;
        touchEndY.current = e.targetTouches[0].clientY;
        hasSwiped.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndY.current = e.targetTouches[0].clientY;
        if (touchStartY.current !== null && Math.abs(touchStartY.current - e.targetTouches[0].clientY) > 10) {
            hasSwiped.current = true;
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (touchStartY.current === null || touchEndY.current === null) return;

        const diffY = touchStartY.current - touchEndY.current;
        const minSwipeDistance = 50;

        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                // Swipe UP -> Next video
                navigateNext();
            } else {
                // Swipe DOWN -> Prev video
                navigatePrev();
            }
        }

        touchStartY.current = null;
        touchEndY.current = null;
    }, [navigateNext, navigatePrev]);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const handleDisplayClick = useCallback((e: React.MouseEvent) => {
        if (hasSwiped.current) {
            hasSwiped.current = false;
            return;
        }
        togglePlay();
    }, [togglePlay]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const nextVal = !prev;
            localStorage.setItem("mycaption_clips_muted", String(nextVal));
            return nextVal;
        });
    }, []);

    const handleTimeUpdate = useCallback((time: number, dur: number) => {
        setCurrentTime(time);
        setDuration(dur);
    }, []);

    // 4. Keyboard controls listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (clips.length === 0) return;

            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                navigatePrev();
            } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                navigateNext();
            } else if (e.key === " ") { // Spacebar toggles play/pause
                e.preventDefault();
                togglePlay();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [clips.length, navigatePrev, navigateNext, togglePlay]);

    // 5. Calculate Sync Captions
    const activeClip = clips[currentIdx];
    const captionLines = activeClip ? getCaptionLines(activeClip) : [];
    const totalLines = captionLines.length;
    const clipDuration = duration || activeClip?.duration_seconds || 15; // default 15s if API returns 0

    // Time per line segment
    const segmentDuration = clipDuration / Math.max(1, totalLines);
    // Find active line index
    const activeLineIdx = Math.min(totalLines - 1, Math.floor(currentTime / segmentDuration));
    const currentLineText = captionLines[activeLineIdx] || "";

    // Progress percentage of the active segment
    const segmentTimeElapsed = currentTime % segmentDuration;
    const segmentProgress = segmentTimeElapsed / segmentDuration;

    // Word-by-word typing: calculate text subset to display based on segment progress
    // Type characters out, completing typing by 70% of the segment so the reader has time to read
    const typingThreshold = 0.70;
    const displayCharCount = segmentProgress >= typingThreshold
        ? currentLineText.length
        : Math.min(currentLineText.length, Math.floor((segmentProgress / typingThreshold) * currentLineText.length));
    const activeTypedText = currentLineText.slice(0, displayCharCount);

    // 6. Interaction Rails handlers
    const handleLike = (clipId: string) => {
        setLikedClips(prev => {
            const updated = new Set(prev);
            if (updated.has(clipId)) {
                updated.delete(clipId);
            } else {
                updated.add(clipId);
            }
            localStorage.setItem("mycaption_liked_clips", JSON.stringify(Array.from(updated)));
            return updated;
        });
    };

    const handleShare = (clip: AIClip) => {
        if (typeof navigator === "undefined" || !navigator.clipboard) return;

        const shareUrl = `${window.location.origin}/ai-clips?clip=${clip.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setShareTooltip(clip.id);
                setTimeout(() => setShareTooltip(null), 2000);
            })
            .catch(err => {
                console.error("Clipboard copy failed:", err);
            });
    };

    // Render helper for left and right peek cards
    const renderPeekCard = (direction: "prev" | "next") => {
        if (clips.length === 0) return null;

        const peekIndex = direction === "prev"
            ? (currentIdx - 1 + clips.length) % clips.length
            : (currentIdx + 1) % clips.length;

        const peekClip = clips[peekIndex];
        if (!peekClip) return null;

        return (
            <button
                className="side-preview"
                onClick={() => {
                    setCurrentIdx(peekIndex);
                    resetVideoProgress();
                }}
                aria-label={`View ${direction} clip`}
            >
                {peekClip.thumbnail_url ? (
                    <img src={peekClip.thumbnail_url} alt={peekClip.title} className="peek-thumb-img" />
                ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        {getClipIcon(peekClip)}
                    </div>
                )}
                <div className="label">{peekClip.title}</div>
            </button>
        );
    };

    if (isLoading && clips.length === 0) {
        return <AIClipsSkeleton />;
    }


    if (clips.length === 0) {
        return (
            <div className="clips-root">
                <div className="clips-loader">
                    <Info size={32} className="text-gray-500" />
                    <p>No clips available at this time.</p>
                </div>
            </div>
        );
    }

    // Sidebar: display all clips including active one

    return (
        <div className="clips-root">
            {/* Scroll Hint Badges */}

            <div className="clips-body">
                <div className="clips-stage">
                    <div className="clips-stage-row">
                        {/* Peek Left Card */}
                        {renderPeekCard("prev")}

                        {/* Center Reels Player Card */}
                        <div 
                            className="clips-display" 
                            onClick={handleDisplayClick}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <YoutubeReelPlayer
                                videoId={activeClip.youtube_video_id}
                                isPlaying={isPlaying}
                                isMuted={isMuted}
                                onVideoEnded={navigateNext}
                                onTimeUpdate={handleTimeUpdate}
                            />

                            {/* Playback overlay controls indicator (Play/Pause icons) */}
                            {!isPlaying && (
                                <div className="clips-video-icon pointer-events-none">
                                    <div className="bg-black/50 p-4 rounded-full">
                                        <Play size={36} fill="#fff" color="#fff" />
                                    </div>
                                </div>
                            )}

                            {/* Dynamic progress bar fill */}
                            <div className="clip-progress">
                                <div className="clip-progress-fill" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}></div>
                            </div>

                            {/* Badge */}
                            <div className="badge">AI SHORT</div>

                            {/* Anchored bottom overlay footer */}
                            <div className="clip-footer" onClick={e => e.stopPropagation()}>
                                {activeClip.channel_title && (
                                    <div className="channel-row">
                                        <div className="channel-avatar">
                                            {activeClip.channel_title.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="channel-meta">
                                            <div className="channel-name">@{activeClip.channel_title}</div>
                                            <div className="channel-subs">
                                                {formatSubs(activeClip.view_count)} subscribers
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="footer-bottom-row">
                                    <div className="clip-title">{activeClip.title}</div>
                                    <button 
                                        className="clip-info-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInfoOpen(true);
                                        }}
                                        aria-label="Show details"
                                    >
                                        <Info size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Immersive Video Details Popup Overlay */}
                            {infoOpen && (
                                <div className="clip-info-overlay" onClick={(e) => { e.stopPropagation(); setInfoOpen(false); }}>
                                    <div className="clip-info-panel" onClick={e => e.stopPropagation()}>
                                        <button className="clip-info-close" onClick={() => setInfoOpen(false)} aria-label="Close details">
                                            <X size={18} />
                                        </button>
                                        
                                        <div className="clip-info-header">
                                            <h3>About this Clip</h3>
                                        </div>

                                        <div className="clip-info-body">
                                            <h4 className="info-clip-title">{activeClip.title}</h4>
                                            
                                            {activeClip.channel_title && (
                                                <div className="info-channel-row">
                                                    <span className="info-channel-name">@{activeClip.channel_title}</span>
                                                    <span className="info-views">· {activeClip.view_count?.toLocaleString()} views</span>
                                                </div>
                                            )}
                                            
                                            <div className="info-description-box">
                                                <p>{activeClip.description || activeClip.summary || "No description available for this clip."}</p>
                                            </div>

                                            {activeClip.tags && activeClip.tags.length > 0 && (
                                                <div className="info-tags-list">
                                                    {activeClip.tags.map(tag => (
                                                        <span key={tag} className="info-tag-pill">#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Peek Right Card */}
                        {renderPeekCard("next")}
                    </div>

                    {/* Nav controls sitting directly below the clip display */}
                    <div className="clips-stage-controls">
                        <button className="ctrl-btn" onClick={navigatePrev} aria-label="Previous clip">
                            ‹
                        </button>
                        <div className="dots">
                            {clips.slice(0, 7).map((_, i) => (
                                <button
                                    key={i}
                                    className={`dot ${i === currentIdx ? "active" : ""}`}
                                    onClick={() => {
                                        setCurrentIdx(i);
                                        resetVideoProgress();
                                    }}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button className="ctrl-btn" onClick={navigateNext} aria-label="Next clip">
                            ›
                        </button>
                        <button className="mute-btn" onClick={toggleMute} aria-label="Toggle mute">
                            {!isMuted ? "🔊" : "🔇"}
                        </button>
                    </div>
                </div>

                <div className="clips-explore">
                    <div className="drag-handle">
                        <div></div>
                    </div>
                    <div className="explore-header">
                        <h2>Explore Feed</h2>
                        <span className="desktop-only refresh-link" onClick={handleRefresh} style={{ cursor: "pointer" }}>
                            Refresh
                        </span>
                    </div>
                    <div className="explore-list" id="feedList">
                        {clips.map((clip, index) => {
                            const isActive = index === currentIdx;
                            return (
                                <div
                                    key={clip.id}
                                    className={`feed-item ${isActive ? "active" : ""}`}
                                    onClick={() => {
                                        setCurrentIdx(index);
                                        resetVideoProgress();
                                    }}
                                >
                                    {clip.thumbnail_url ? (
                                        <img
                                            src={clip.thumbnail_url}
                                            alt={clip.title}
                                            className="feed-thumb"
                                        />
                                    ) : (
                                        <div className="feed-thumb flex items-center justify-center">
                                            <Tv size={20} className="text-slate-600" />
                                        </div>
                                    )}
                                    <div className="feed-info">
                                        <div className="feed-title">{clip.title}</div>
                                        <div className="feed-meta">
                                            @{clip.channel_title || "creator"} · {(clip.view_count || 0).toLocaleString()} views
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Load More & Refresh feed buttons */}
                        <div className="explore-actions">
                            {hasMore && (
                                <button className="explore-action-btn load-more-btn" onClick={loadMoreClips} disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Load More"}
                                </button>
                            )}
                            <button className="explore-action-btn refresh-feed-btn" onClick={handleRefresh} disabled={isLoading}>
                                Refresh Feed
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
