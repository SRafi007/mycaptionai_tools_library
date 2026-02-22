"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/app/actions/analytics";

const CONSENT_KEY = "mc_analytics_consent";
const VISITOR_KEY = "mc_visitor_id";
const SESSION_KEY = "mc_session_id";

function getConsentStatus(): "granted" | "denied" | "unknown" {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return "unknown";
}

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
            const consentStatus = getConsentStatus();
            const dntSignal =
                navigator.doNotTrack === "1" ||
                (window as any).doNotTrack === "1" ||
                (navigator as any).msDoNotTrack === "1";
            const gpcSignal = Boolean((navigator as any).globalPrivacyControl);

            // Respect opt-out signals and missing consent.
            if (consentStatus !== "granted" || dntSignal || gpcSignal) {
                tracked.current = pathname;
                return;
            }

            const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
            const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);

            tracked.current = pathname;
            trackPageView({
                pathname,
                query_string: window.location.search || undefined,
                visitor_id: visitorId,
                session_id: sessionId,
                referrer: document.referrer || undefined,
                consent_status: consentStatus,
                dnt_signal: dntSignal,
                gpc_signal: gpcSignal,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
        }
    }, [pathname]);

    return null; // Renders nothing - pure side-effect component.
}
