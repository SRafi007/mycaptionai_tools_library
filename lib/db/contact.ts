import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();

  const { data, error } = await supabase
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
