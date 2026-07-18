"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/v2";
  }

  if (!value.startsWith("/v2") || value.startsWith("//")) {
    return "/v2";
  }

  return value;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect("/v2/login?error=Email%20and%20password%20are%20required.");
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/v2/login?error=${encodeURIComponent(
        "The email or password was not accepted.",
      )}`,
    );
  }

  redirect(nextPath);
}
