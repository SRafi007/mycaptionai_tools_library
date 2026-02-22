"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView, trackUserAction } from "@/app/actions/analytics";

const VISITOR_KEY = "mc_visitor_id";
const SESSION_KEY = "mc_session_id";

function getOrCreateId(storage: Storage, key: string): string {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    storage.setItem(key, created);
    return created;
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
            trackPageView({
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
            trackUserAction({
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
