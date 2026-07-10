export type AIClipStatus = "draft" | "published" | "archived";
export type AIClipReviewStatus = "pending" | "approved" | "rejected" | "auto_approved";

export interface AIClip {
    id: string;
    youtube_video_id: string;
    youtube_url: string;
    shorts_url: string | null;
    embed_url: string;
    thumbnail_url: string | null;
    title: string;
    description: string | null;
    channel_title: string | null;
    channel_id: string | null;
    published_at: string | null;
    duration_seconds: number | null;
    is_youtube_short: boolean;
    is_embeddable: boolean;
    language_code: string;
    content_category: string | null;
    tags: string[];
    summary: string | null;
    hook_text: string | null;
    view_count: number;
    like_count: number;
    comment_count: number;
    relevance_score: number | null;
    quality_score: number | null;
    priority_score: number | null;
    status: AIClipStatus;
    review_status: AIClipReviewStatus;
    is_featured: boolean;
    discovered_by: string | null;
    discovery_query: string | null;
    last_synced_at: string;
    created_at: string;
    updated_at: string;
    display_score: number | null;
}

export interface AIClipsResponse {
    clips: AIClip[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
