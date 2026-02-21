import { createClient } from "@/lib/supabase/server";
import { Tag } from "@/types/tag";

export async function getTags(): Promise<Tag[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching tags:", error);
        return [];
    }

    return data as Tag[];
}
