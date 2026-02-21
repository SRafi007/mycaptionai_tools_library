"use server";

import { trackEvent } from "@/lib/db/analytics";

export async function trackPageView(pathname: string) {
    return trackEvent({
        event_type: "page_view",
        metadata: { pathname }
    });
}
