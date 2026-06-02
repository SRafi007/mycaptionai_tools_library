"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Request a Magic Link (OTP Email) for passwordless sign-in
 */
export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email address is required." };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "";
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Supabase email templates should direct users to this confirmation URL
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Sign in using an OAuth provider (e.g. Google, GitHub)
 */
export async function signInWithOAuth(provider: "google" | "github") {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") || "";
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.url) {
    redirect(data.url); // Redirect to provider OAuth consent screen
  }

  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Retrieve the current authenticated user profile
 */
export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    ...user,
    profile,
  };
}
