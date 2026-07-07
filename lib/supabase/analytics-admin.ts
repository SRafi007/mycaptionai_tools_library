import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAnalyticsAdmin = createClient(
    process.env.NEXT_PUBLIC_ANALYTICS_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.ANALYTICS_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);
