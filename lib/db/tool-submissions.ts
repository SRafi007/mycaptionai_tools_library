import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

interface CreateToolSubmissionInput {
    toolName: string;
    officialUrl: string;
    submitterEmail: string;
    submittedBy: string;
    relationshipToCompany: string;
    description?: string;
    note?: string;
    companyContact?: string;
}

export async function createToolSubmission(input: CreateToolSubmissionInput): Promise<boolean> {
    const { error } = await supabaseAdmin.from("tool_submissions").insert({
        tool_name: input.toolName,
        official_url: input.officialUrl,
        submitter_email: input.submitterEmail,
        submitted_by: input.submittedBy,
        relationship_to_company: input.relationshipToCompany,
        description: input.description || null,
        note: input.note || null,
        company_contact: input.companyContact || null,
    });

    if (error) {
        console.error("Error creating tool submission:", error);
        return false;
    }

    return true;
}
