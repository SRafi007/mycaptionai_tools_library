export interface AnalyticsEvent {
    id?: string;
    user_id?: string | null;
    event_type: string;
    path?: string | null;
    referer?: string | null;
    user_agent?: string | null;
    ip_address?: string | null;
    device_type?: string | null;
    country?: string | null;
    metadata?: Record<string, any> | null;
    created_at?: string;
}
