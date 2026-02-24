export const SITE_URL = "https://mycaptionai.com";
export const SITE_NAME = "MyCaptionAI";
export const DEFAULT_OG_IMAGE_PATH = "/image/og-default.png";

export function absoluteUrl(path = "/"): string {
    if (!path) return SITE_URL;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
