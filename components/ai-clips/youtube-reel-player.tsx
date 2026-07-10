"use client";

import { useEffect, useRef, useState } from "react";

// Extend global window interface for YT types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

interface YoutubeReelPlayerProps {
    videoId: string;
    isPlaying: boolean;
    isMuted: boolean;
    onVideoEnded: () => void;
    onTimeUpdate: (currentTime: number, duration: number) => void;
}

let apiLoadedPromise: Promise<any> | null = null;

// Loads the YouTube Iframe API only once
function loadYoutubeApi(): Promise<any> {
    if (typeof window === "undefined") return Promise.reject("Not in browser");
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);

    if (!apiLoadedPromise) {
        apiLoadedPromise = new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve(window.YT);
                return;
            }

            const previousCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previousCallback) previousCallback();
                resolve(window.YT);
            };

            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        });
    }
    return apiLoadedPromise;
}

export default function YoutubeReelPlayer({
    videoId,
    isPlaying,
    isMuted,
    onVideoEnded,
    onTimeUpdate,
}: YoutubeReelPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Keep props synchronized in refs to prevent useEffect recreation triggers
    const isPlayingRef = useRef(isPlaying);
    const isMutedRef = useRef(isMuted);
    const onVideoEndedRef = useRef(onVideoEnded);
    const onTimeUpdateRef = useRef(onTimeUpdate);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        isMutedRef.current = isMuted;
        onVideoEndedRef.current = onVideoEnded;
        onTimeUpdateRef.current = onTimeUpdate;
    });

    // Initializer effect when videoId changes
    useEffect(() => {
        let active = true;
        let player: any = null;

        loadYoutubeApi()
            .then((YT) => {
                if (!active || !containerRef.current) return;

                player = new YT.Player(containerRef.current, {
                    videoId: videoId,
                    playerVars: {
                        autoplay: isPlayingRef.current ? 1 : 0,
                        mute: isMutedRef.current ? 1 : 0,
                        controls: 0,
                        loop: 1,
                        playlist: videoId, // Required for loop in YouTube iframe API
                        modestbranding: 1,
                        rel: 0,
                        playsinline: 1,
                        showinfo: 0,
                        iv_load_policy: 3,
                        fs: 0,
                        disablekb: 1,
                    },
                    events: {
                        onReady: (event: any) => {
                            if (!active) return;
                            playerRef.current = event.target;
                            setIsPlayerReady(true);
                            
                            // Initialize state based on current props
                            if (isPlayingRef.current) {
                                event.target.playVideo();
                            } else {
                                event.target.pauseVideo();
                            }
                            
                            event.target.setVolume(isMutedRef.current ? 0 : 100);
                            if (isMutedRef.current) {
                                event.target.mute();
                            } else {
                                event.target.unMute();
                            }
                        },
                        onStateChange: (event: any) => {
                            if (!active) return;
                            // event.data: 0 is ENDED
                            if (event.data === 0) {
                                onVideoEndedRef.current();
                            }
                        },
                    },
                });
            })
            .catch((err) => {
                console.error("Failed to load YouTube player API:", err);
            });

        return () => {
            active = false;
            setIsPlayerReady(false);
            playerRef.current = null;
            if (player && typeof player.destroy === "function") {
                try {
                    player.destroy();
                } catch (e) {
                    // Ignore destroy errors on cleanup
                }
            }
        };
    }, [videoId]);

    // Handle Play / Pause updates
    useEffect(() => {
        if (!isPlayerReady || !playerRef.current) return;
        try {
            if (isPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        } catch (e) {
            console.error("YouTube play/pause state change failed:", e);
        }
    }, [isPlaying, isPlayerReady, videoId]);

    // Handle Mute / Unmute updates
    useEffect(() => {
        if (!isPlayerReady || !playerRef.current) return;
        try {
            if (isMuted) {
                playerRef.current.mute();
                playerRef.current.setVolume(0);
            } else {
                playerRef.current.unMute();
                playerRef.current.setVolume(100);
            }
        } catch (e) {
            console.error("YouTube volume/mute state change failed:", e);
        }
    }, [isMuted, isPlayerReady, videoId]);

    // Playback time polling effect
    useEffect(() => {
        if (!isPlayerReady || !playerRef.current || !isPlaying) return;

        const interval = setInterval(() => {
            if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
            try {
                const currentTime = playerRef.current.getCurrentTime() || 0;
                const duration = playerRef.current.getDuration() || 0;
                onTimeUpdateRef.current(currentTime, duration);
            } catch (e) {
                // Fail silently during buffering or transition
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying, isPlayerReady, videoId]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
            {/* YouTube Player placeholder (replaced by YouTube iframe API) */}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
