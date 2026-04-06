import { Tool } from "./tool";
import { Ecosystem } from "./ecosystem";

export interface Playbook {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    ecosystem_id: string | null;
    author_id: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlaybookWithDetails extends Playbook {
    ecosystem?: Ecosystem | null;
    tools: (Tool & { step_order: number; step_description: string | null })[];
}
