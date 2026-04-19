import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { Ecosystem, EcosystemWithTools, EcosystemWithPreview, EcosystemPreviewTool } from "../../types/ecosystem";

export async function getEcosystemsWithPreview(previewLimit = 5): Promise<EcosystemWithPreview[]> {
    const [{ data: ecosystems, error: ecoError }, { data: junction, error: jErr }] = await Promise.all([
        supabase.from("ecosystems").select("*").order("name", { ascending: true }),
        supabase
            .from("ecosystem_tools")
            .select("ecosystem_id, tools(id, name, slug, icon_url, upvotes)"),
    ]);

    if (ecoError || !ecosystems) {
        console.error("Error fetching ecosystems:", ecoError);
        return [];
    }
    if (jErr) {
        console.error("Error fetching ecosystem_tools:", jErr);
    }

    const grouped = new Map<string, { tool: EcosystemPreviewTool; upvotes: number }[]>();
    type JunctionRow = {
        ecosystem_id: string;
        tools: { id: string; name: string; slug: string; icon_url: string | null; upvotes: number | null } | null;
    };
    for (const row of ((junction || []) as unknown) as JunctionRow[]) {
        if (!row.tools) continue;
        const list = grouped.get(row.ecosystem_id) || [];
        list.push({
            tool: { id: row.tools.id, name: row.tools.name, slug: row.tools.slug, icon_url: row.tools.icon_url },
            upvotes: row.tools.upvotes ?? 0,
        });
        grouped.set(row.ecosystem_id, list);
    }

    return (ecosystems as Ecosystem[]).map((eco) => {
        const list = grouped.get(eco.id) || [];
        list.sort((a, b) => b.upvotes - a.upvotes);
        return {
            ...eco,
            tool_count: list.length,
            preview_tools: list.slice(0, previewLimit).map((entry) => entry.tool),
        };
    });
}

export async function getEcosystems(): Promise<Ecosystem[]> {
    const { data, error } = await supabase
        .from("ecosystems")
        .select("*")
        .order("name", { ascending: true });
        
    if (error) {
        console.error("Error fetching ecosystems:", error);
        return [];
    }
    
    return data as Ecosystem[];
}

export async function getEcosystemBySlug(slug: string): Promise<EcosystemWithTools | null> {
    const { data: ecosystem, error: ecoError } = await supabase
        .from("ecosystems")
        .select("*")
        .eq("slug", slug)
        .single();
        
    if (ecoError || !ecosystem) {
        console.error("Error fetching ecosystem:", ecoError);
        return null;
    }
    
    const { data: junctionData, error: toolsError } = await supabase
        .from("ecosystem_tools")
        .select(`
            role_category,
            tools (*)
        `)
        .eq("ecosystem_id", ecosystem.id);
        
    if (toolsError) {
        console.error("Error fetching ecosystem tools:", toolsError);
        return { ...ecosystem, tools: [] } as EcosystemWithTools;
    }
    
    // Map the junction data to flat tools with role_category
    const tools = junctionData?.map((item: any) => ({
        ...item.tools,
        role_category: item.role_category,
    })) || [];
    
    return {
        ...ecosystem,
        tools,
    } as EcosystemWithTools;
}
