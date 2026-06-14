export const SITE_URL = "https://mycaptionai.com";
export const SITE_NAME = "MyCaptionAI";
export const DEFAULT_OG_IMAGE_PATH = "/image/og-default.png";

const SITE_HOSTNAME = new URL(SITE_URL).hostname;

function normalizeHostname(hostname: string): string {
    return hostname.toLowerCase().replace(/^www\./, "");
}

export function absoluteUrl(path = "/"): string {
    if (!path) return SITE_URL;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function normalizeCanonicalUrl(value: string | null | undefined): string | null {
    if (!value) return null;

    try {
        const url = new URL(value);
        if (!["http:", "https:"].includes(url.protocol)) return null;

        url.hash = "";
        if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
            url.pathname = url.pathname.slice(0, -1);
        }

        if (normalizeHostname(url.hostname) === normalizeHostname(SITE_HOSTNAME)) {
            return `${SITE_URL}${url.pathname}${url.search}`;
        }

        return url.toString();
    } catch {
        return null;
    }
}

export function isLocalSiteUrl(value: string | null | undefined): boolean {
    const normalized = normalizeCanonicalUrl(value);
    if (!normalized) return false;

    try {
        return normalizeHostname(new URL(normalized).hostname) === normalizeHostname(SITE_HOSTNAME);
    } catch {
        return false;
    }
}

export function localCanonicalUrl(candidate: string | null | undefined, fallbackPath: string): string {
    const normalized = normalizeCanonicalUrl(candidate);
    return normalized && isLocalSiteUrl(normalized) ? normalized : absoluteUrl(fallbackPath);
}
