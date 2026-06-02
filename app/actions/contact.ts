"use server";

import { createContactSubmission } from "@/lib/db/contact";
import { createClient } from "@/lib/supabase/server";

export async function submitContactForm(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subjectType = formData.get("subject_type") as any;
  const message = formData.get("message") as string;

  // Simple validation
  if (!name || !email || !subjectType || !message) {
    return { error: "All fields are required." };
  }

  // Validate subject type
  const validSubjects = ["sponsorship", "issue", "collaboration", "general", "other"];
  if (!validSubjects.includes(subjectType)) {
    return { error: "Invalid subject category." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    await createContactSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject_type: subjectType,
      message: message.trim(),
      user_id: userId,
    });

    return { success: true, message: "Thank you! Your message has been submitted successfully." };
  } catch (err: any) {
    console.error("Error in submitContactForm action:", err);
    return { error: err.message || "Something went wrong. Please try again later." };
  }
}
