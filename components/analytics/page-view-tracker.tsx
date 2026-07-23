"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import type { Activity } from "@/types/analytics";

// ─── Storage keys ───────────────────────────────────────────────────────────
const VISITOR_KEY = "mc_visitor_id";
const SESSION_KEY = "mc_session_id";

// ─── Config ─────────────────────────────────────────────────────────────────
const SAFETY_FLUSH_INTERVAL_MS = 60_000; // flush every 60s if buffer is non-empty
const MAX_BUFFER_SIZE = 50;              // force-flush if buffer exceeds this

// ─── Module-level activity buffer ───────────────────────────────────────────
// Kept outside React to survive re-renders and be accessible from event handlers
let activityBuffer: Activity[] = [];
let flushScheduled = false;

function getOrCreateId(storage: Storage, key: string): string {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    storage.setItem(key, created);
    return created;
}

/**
 * Sends the buffered activities to /api/track via sendBeacon.
 * Clears the buffer after sending.
 */
function flushActivities() {
    if (typeof window === "undefined" || activityBuffer.length === 0) return;

    const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);

    // Detect client-side automation/headless footprints
    const isWebdriver = navigator.webdriver || false;
    const isHeadless = /HeadlessChrome|jsdom|puppeteer/i.test(navigator.userAgent);

    const payload = {
        visitor_id: visitorId,
        session_id: sessionId,
        activities: [...activityBuffer],
        referrer: document.referrer || undefined,
        language: navigator.language || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${window.screen.width}x${window.screen.height}`,
        is_webdriver: isWebdriver,
        is_headless: isHeadless,
    };

    // Clear buffer immediately (before async send)
    activityBuffer = [];

    const jsonString = JSON.stringify(payload);

    // Prefer sendBeacon for fire-and-forget background transmission
    if (navigator.sendBeacon) {
        try {
            const blob = new Blob([jsonString], { type: "application/json" });
            const success = navigator.sendBeacon("/api/track", blob);
            if (success) return;
        } catch (e) {
            console.error("sendBeacon failed, falling back to keepalive fetch:", e);
        }
    }

    // Fallback to fetch with keepalive
    fetch("/api/track", {
        method: "POST",
        body: jsonString,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
    }).catch((e) => console.error("Error flushing activities:", e));
}

/**
 * Pushes an activity to the buffer and triggers a force-flush if the buffer is full.
 */
function pushActivity(activity: Activity) {
    activityBuffer.push(activity);

    if (activityBuffer.length >= MAX_BUFFER_SIZE) {
        flushActivities();
    }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PageViewTracker() {
    const pathname = usePathname();
    const tracked = useRef<string | null>(null);
    const safetyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Flush handler (stable ref) ──
    const handleFlush = useCallback(() => {
        flushActivities();
    }, []);

    // ── Track page views on pathname change ──
    useEffect(() => {
        if (pathname && pathname !== tracked.current) {
            tracked.current = pathname;
            pushActivity({
                t: "pv",
                p: pathname,
                tt: document.title || undefined,
                qs: window.location.search || undefined,
                ts: Date.now(),
            });
        }
    }, [pathname]);

    // ── Global event listeners: clicks, form submits ──
    useEffect(() => {
        if (!pathname) return;

        const onClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target) return;

            const trackedElement = target.closest("a,button,[data-analytics-action]");
            if (!trackedElement) return;

            const explicitAction = trackedElement.getAttribute("data-analytics-action");
            const tagName = trackedElement.tagName.toLowerCase();

            // Determine label
            const label =
                trackedElement.getAttribute("data-analytics-label") ||
                trackedElement.textContent?.trim().slice(0, 120) ||
                undefined;

            // Determine target URL
            let resolvedTarget: string | undefined;
            if (trackedElement instanceof HTMLAnchorElement) {
                resolvedTarget = trackedElement.href || undefined;
            }

            // Check for search action
            const isSearch = explicitAction === "search" ||
                trackedElement.getAttribute("data-analytics-search") !== null;

            if (isSearch) {
                const searchQuery = trackedElement.getAttribute("data-analytics-query") ||
                    label || undefined;
                if (searchQuery) {
                    pushActivity({
                        t: "sr",
                        p: pathname,
                        q: searchQuery,
                        ts: Date.now(),
                    });
                }
                return;
            }

            pushActivity({
                t: "ck",
                p: pathname,
                tg: resolvedTarget,
                lb: label,
                el: tagName,
                ts: Date.now(),
            });
        };

        const onSubmit = (event: SubmitEvent) => {
            const form = event.target as HTMLFormElement | null;
            if (!form) return;

            // Check if this is a search form
            const isSearchForm = form.getAttribute("data-analytics-search") !== null ||
                form.getAttribute("role") === "search";

            if (isSearchForm) {
                const searchInput = form.querySelector<HTMLInputElement>(
                    "input[type='search'], input[name='q'], input[name='query'], input[name='search']"
                );
                if (searchInput?.value) {
                    pushActivity({
                        t: "sr",
                        p: pathname,
                        q: searchInput.value.trim().slice(0, 200),
                        ts: Date.now(),
                    });
                    return;
                }
            }

            const label =
                form.getAttribute("data-analytics-label") ||
                form.getAttribute("name") ||
                form.id ||
                undefined;
            const target = form.getAttribute("action") || undefined;

            pushActivity({
                t: "fs",
                p: pathname,
                tg: target,
                lb: label,
                el: "form",
                ts: Date.now(),
            });
        };

        document.addEventListener("click", onClick, true);
        document.addEventListener("submit", onSubmit, true);
        return () => {
            document.removeEventListener("click", onClick, true);
            document.removeEventListener("submit", onSubmit, true);
        };
    }, [pathname]);

    // ── Flush on visibility change, pagehide, beforeunload ──
    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                flushActivities();
            }
        };

        const onPageHide = () => {
            flushActivities();
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("pagehide", onPageHide);
        window.addEventListener("beforeunload", handleFlush);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("pagehide", onPageHide);
            window.removeEventListener("beforeunload", handleFlush);
        };
    }, [handleFlush]);

    // ── Safety flush interval: flush every 60s if buffer has items ──
    useEffect(() => {
        safetyTimerRef.current = setInterval(() => {
            if (activityBuffer.length > 0) {
                flushActivities();
            }
        }, SAFETY_FLUSH_INTERVAL_MS);

        return () => {
            if (safetyTimerRef.current) {
                clearInterval(safetyTimerRef.current);
            }
        };
    }, []);

    return null; // Renders nothing — pure side-effect component.
}
