"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/app/actions/analytics";

export default function PageViewTracker() {
    const pathname = usePathname();
    const tracked = useRef<string | null>(null);

    useEffect(() => {
        // Only track once per pathname to avoid duplicates on re-renders
        if (pathname && pathname !== tracked.current) {
            tracked.current = pathname;
            trackPageView(pathname);
        }
    }, [pathname]);

    return null; // Renders nothing — pure side-effect component
}
