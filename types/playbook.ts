import { Tool } from "./tool";
import { Ecosystem } from "./ecosystem";

export interface Playbook {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    cover_url?: string | null;
    ecosystem_id: string | null;
    author_id: string | null;
    is_published: boolean;
    visual_position?: number | null;
    created_at: string;
    updated_at: string;
}

export interface PlaybookWithDetails extends Playbook {
    ecosystem?: Ecosystem | null;
    tools: (Tool & { 
        step_order: number; 
        step_description: string | null;
        step_title?: string | null;
        step_goal?: string | null;
        how_to_use?: string | null;
        input_needed?: string | null;
        output_expected?: string | null;
        why_this_tool?: string | null;
        step_kind?: string | null;
        file_name?: string | null;
        prompt?: string | null;
    })[];
}
