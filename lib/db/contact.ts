import { supabaseAdmin } from "@/lib/supabase/admin";

interface ContactSubmissionInput {
  name: string;
  email: string;
  subject_type: "sponsorship" | "issue" | "collaboration" | "general" | "other";
  message: string;
  user_id?: string | null;
}

/**
 * Inserts a new contact submission into the database
 */
export async function createContactSubmission(input: ContactSubmissionInput) {
  // Contact forms are submitted through a validated server action. Use the
  // server-only service-role client so an anonymous visitor is not required to
  // have direct INSERT access to this internal table.
  const { data, error } = await supabaseAdmin
    .from("contact_submissions")
    .insert([
      {
        name: input.name,
        email: input.email,
        subject_type: input.subject_type,
        message: input.message,
        user_id: input.user_id || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating contact submission:", error);
    throw new Error(error.message);
  }

  return data;
}
