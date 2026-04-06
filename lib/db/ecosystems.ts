import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { Ecosystem, EcosystemWithTools } from "../../types/ecosystem";

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
