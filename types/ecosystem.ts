import { Tool } from "./tool";

export interface Ecosystem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface EcosystemTool {
    id: string;
    ecosystem_id: string;
    tool_id: string;
    role_category: string | null;
    display_order?: number | null;
    integration_type?: string | null;
    ecosystem_summary?: string | null;
    when_to_use?: string | null;
    how_to_use?: string | null;
    best_for?: string | null;
    use_case_examples?: string[] | null;
    recommendation?: string | null;
    caveats?: string | null;
    is_official?: boolean | null;
    source_url?: string | null;
    content_status?: "active" | "preview" | "beta" | "sunsetting" | "retired" | null;
    created_at: string;
    updated_at?: string | null;
}

export interface EcosystemWithTools extends Ecosystem {
    tools: (Tool & {
        role_category: string | null;
        display_order?: number | null;
        integration_type?: string | null;
        ecosystem_summary?: string | null;
        when_to_use?: string | null;
        how_to_use?: string | null;
        best_for?: string | null;
        use_case_examples?: string[] | null;
        recommendation?: string | null;
        caveats?: string | null;
        is_official?: boolean | null;
        source_url?: string | null;
        content_status?: "active" | "preview" | "beta" | "sunsetting" | "retired" | null;
    })[];
}

export interface EcosystemPreviewTool {
    id: string;
    name: string;
    slug: string;
    icon_url: string | null;
    role_category?: string | null;
}

export interface EcosystemWithPreview extends Ecosystem {
    tool_count: number;
    preview_tools: EcosystemPreviewTool[];
}
