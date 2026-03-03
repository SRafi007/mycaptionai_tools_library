import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

interface CreateToolSubmissionInput {
    toolName: string;
    officialUrl: string;
    submitterEmail: string;
}

export async function createToolSubmission(input: CreateToolSubmissionInput): Promise<boolean> {
    const { error } = await supabaseAdmin.from("tool_submissions").insert({
        tool_name: input.toolName,
        official_url: input.officialUrl,
        submitter_email: input.submitterEmail,
    });

    if (error) {
        console.error("Error creating tool submission:", error);
        return false;
    }

    return true;
}
