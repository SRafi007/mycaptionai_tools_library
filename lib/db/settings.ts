import { supabaseAdmin } from "@/lib/supabase/admin";

const supabase = supabaseAdmin;

export async function getSettings(keys: string[]): Promise<Record<string, any>> {
    const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", keys);

    if (error) {
        console.error("Error fetching settings:", error);
        return {};
    }

    const settings: Record<string, any> = {};
    data.forEach((item: { key: string; value: any }) => {
        settings[item.key] = item.value;
    });

    return settings;
}
