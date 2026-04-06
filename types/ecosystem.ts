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
    created_at: string;
}

export interface EcosystemWithTools extends Ecosystem {
    tools: (Tool & { role_category: string | null })[];
}
