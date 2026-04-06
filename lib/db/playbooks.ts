import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { Playbook, PlaybookWithDetails } from "../../types/playbook";

export async function getPublishedPlaybooks(): Promise<Playbook[]> {
    const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
        
    if (error) {
        console.error("Error fetching playbooks:", error);
        return [];
    }
    
    return data as Playbook[];
}

export async function getPlaybookBySlug(slug: string): Promise<PlaybookWithDetails | null> {
    const { data: playbook, error: pError } = await supabase
        .from("playbooks")
        .select(`
            *,
            ecosystems (*)
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
        
    if (pError || !playbook) {
        console.error("Error fetching playbook:", pError);
        return null;
    }
    
    const { data: junctionData, error: toolsError } = await supabase
        .from("playbook_tools")
        .select(`
            step_order,
            step_description,
            tools (*)
        `)
        .eq("playbook_id", playbook.id)
        .order('step_order', { ascending: true });
        
    if (toolsError) {
        console.error("Error fetching playbook tools:", toolsError);
    }
    
    const tools = junctionData?.map((item: any) => ({
        ...item.tools,
        step_order: item.step_order,
        step_description: item.step_description
    })) || [];
    
    return {
        ...playbook,
        ecosystem: (playbook as any).ecosystems, // Map inner join result
        tools,
    } as PlaybookWithDetails;
}
