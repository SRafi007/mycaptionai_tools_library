export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    parent_id: string | null;
    tool_count: number;
    seo_title: string | null;
    seo_description: string | null;
    created_at: string;
    updated_at: string;
}
