"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
const VISITOR_KEY = "mc_visitor_id";
const SESSION_KEY = "mc_session_id";

function getOrCreateId(storage: Storage, key: string): string {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    storage.setItem(key, created);
    return created;
}

function postEvent(data: Record<string, any>) {
    if (typeof window === "undefined") return;

    // Detect client-side automation/headless footprints
    const isWebdriver = navigator.webdriver || false;
    const isHeadless = /HeadlessChrome|jsdom|puppeteer/i.test(navigator.userAgent);

    const payload = {
        ...data,
        is_webdriver: isWebdriver,
        is_headless: isHeadless,
    };

    const jsonString = JSON.stringify(payload);

    // Prefer sendBeacon for fire-and-forget background transmission
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        try {
            const blob = new Blob([jsonString], { type: "application/json" });
            const success = navigator.sendBeacon("/api/track", blob);
            if (success) return;
        } catch (e) {
            console.error("sendBeacon failed, falling back to keepalive fetch:", e);
        }
    }

    // Fallback to fetch with keepalive: true so it completes even if the page unloads
    fetch("/api/track", {
        method: "POST",
        body: jsonString,
        headers: {
            "Content-Type": "application/json",
        },
        keepalive: true,
    }).catch((e) => console.error("Error reporting event:", e));
}

export default function PageViewTracker() {
    const pathname = usePathname();
    const tracked = useRef<string | null>(null);

    useEffect(() => {
        // Only track once per pathname to avoid duplicates on re-renders.
        if (pathname && pathname !== tracked.current) {
            const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
            const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);

            tracked.current = pathname;
            postEvent({
                event_type: "page_view",
                pathname,
                query_string: window.location.search || undefined,
                visitor_id: visitorId,
                session_id: sessionId,
                referrer: document.referrer || undefined,
                language: navigator.language || undefined,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                page_title: document.title || undefined,
                screen: `${window.screen.width}x${window.screen.height}`,
            });
        }
    }, [pathname]);

    useEffect(() => {
        if (!pathname) return;

        const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
        const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);

        const trackAction = (
            action: string,
            target: string | null,
            label: string | null,
            element: string | null
        ) => {
            postEvent({
                event_type: "user_action",
                pathname,
                query_string: window.location.search || undefined,
                visitor_id: visitorId,
                session_id: sessionId,
                referrer: document.referrer || undefined,
                language: navigator.language || undefined,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                page_title: document.title || undefined,
                screen: `${window.screen.width}x${window.screen.height}`,
                action,
                action_target: target || undefined,
                action_label: label || undefined,
                action_element: element || undefined,
            });
        };

        const onClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            if (!target) return;

            const trackedElement = target.closest("a,button,[data-analytics-action]");
            if (!trackedElement) return;

            const explicitAction = trackedElement.getAttribute("data-analytics-action");
            const tagName = trackedElement.tagName.toLowerCase();
            const action = explicitAction || (tagName === "a" ? "link_click" : "button_click");

            const label =
                trackedElement.getAttribute("data-analytics-label") ||
                trackedElement.textContent?.trim().slice(0, 120) ||
                null;

            let resolvedTarget: string | null = null;
            if (trackedElement instanceof HTMLAnchorElement) {
                resolvedTarget = trackedElement.href || null;
            }

            trackAction(action, resolvedTarget, label, tagName);
        };

        const onSubmit = (event: SubmitEvent) => {
            const form = event.target as HTMLFormElement | null;
            if (!form) return;

            const label = form.getAttribute("data-analytics-label") || form.getAttribute("name") || form.id || null;
            const target = form.getAttribute("action");
            trackAction("form_submit", target, label, "form");
        };

        document.addEventListener("click", onClick, true);
        document.addEventListener("submit", onSubmit, true);
        return () => {
            document.removeEventListener("click", onClick, true);
            document.removeEventListener("submit", onSubmit, true);
        };
    }, [pathname]);

    return null; // Renders nothing - pure side-effect component.
}

