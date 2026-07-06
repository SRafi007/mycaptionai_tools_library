import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { Ecosystem, EcosystemWithTools, EcosystemWithPreview, EcosystemPreviewTool } from "../../types/ecosystem";
import type { Tool } from "@/types/tool";
import { TOOL_LIST_FIELDS } from "./tools";

export async function getEcosystemsWithPreview(previewLimit = 5): Promise<EcosystemWithPreview[]> {
    const [{ data: ecosystems, error: ecoError }, { data: junction, error: jErr }] = await Promise.all([
        supabase.from("ecosystems").select("*").order("name", { ascending: true }),
        supabase
            .from("ecosystem_tools")
            .select("*, tools(id, name, slug, icon_url, upvotes)"),
    ]);

    if (ecoError || !ecosystems) {
        console.error("Error fetching ecosystems:", ecoError);
        return [];
    }
    if (jErr) {
        console.error("Error fetching ecosystem_tools:", jErr);
    }

    const grouped = new Map<string, { tool: EcosystemPreviewTool; upvotes: number; displayOrder: number | null }[]>();
    type JunctionRow = {
        ecosystem_id: string;
        role_category?: string | null;
        display_order?: number | null;
        tools: { id: string; name: string; slug: string; icon_url: string | null; upvotes: number | null } | null;
    };
    for (const row of ((junction || []) as unknown) as JunctionRow[]) {
        if (!row.tools) continue;
        const list = grouped.get(row.ecosystem_id) || [];
        list.push({
            tool: { id: row.tools.id, name: row.tools.name, slug: row.tools.slug, icon_url: row.tools.icon_url, role_category: row.role_category ?? null },
            upvotes: row.tools.upvotes ?? 0,
            displayOrder: row.display_order ?? null,
        });
        grouped.set(row.ecosystem_id, list);
    }

    return (ecosystems as Ecosystem[]).map((eco) => {
        const list = grouped.get(eco.id) || [];
        list.sort((a, b) => {
            const displayDiff = (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
            return displayDiff !== 0 ? displayDiff : b.upvotes - a.upvotes;
        });
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
            *,
            tools (${TOOL_LIST_FIELDS})
        `)
        .eq("ecosystem_id", ecosystem.id);
        
    if (toolsError) {
        console.error("Error fetching ecosystem tools:", toolsError);
        return { ...ecosystem, tools: [] } as EcosystemWithTools;
    }
    
    type EcosystemToolJoinRow = {
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
        tools: Tool | null;
    };

    function hasTool(item: EcosystemToolJoinRow): item is EcosystemToolJoinRow & { tools: Tool } {
        return Boolean(item.tools);
    }

    // Map the junction data to flat tools with ecosystem-specific metadata.
    const tools: EcosystemWithTools["tools"] = (((junctionData || []) as unknown) as EcosystemToolJoinRow[])
        .filter(hasTool)
        .map((item) => ({
        ...item.tools,
        role_category: item.role_category,
        display_order: item.display_order ?? null,
        integration_type: item.integration_type ?? null,
        ecosystem_summary: item.ecosystem_summary ?? null,
        when_to_use: item.when_to_use ?? null,
        how_to_use: item.how_to_use ?? null,
        best_for: item.best_for ?? null,
        use_case_examples: item.use_case_examples ?? null,
        recommendation: item.recommendation ?? null,
        caveats: item.caveats ?? null,
        is_official: item.is_official ?? null,
        source_url: item.source_url ?? null,
        content_status: item.content_status ?? null,
    }));
    tools.sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999) || a.name.localeCompare(b.name));
    
    return {
        ...ecosystem,
        tools,
    } as EcosystemWithTools;
}
