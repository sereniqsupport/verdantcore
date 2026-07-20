"use server";

import { headers } from "next/headers";
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

function normalizeOrigin(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

async function resolveApplicationOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    process.env.APP_URL;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  const requestHeaders = await headers();

  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("The application host could not be determined.");
  }

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

function loginErrorUrl(message: string, nextPath: string) {
  const params = new URLSearchParams({
    error: message,
    next: nextPath,
  });

  return `/v2/login?${params.toString()}`;
}

export async function signInWithGoogle(formData: FormData) {
  const nextPath = safeNextPath(formData.get("next"));

  let origin: string;

  try {
    origin = await resolveApplicationOrigin();
  } catch {
    redirect(
      loginErrorUrl(
        "Google sign-in could not determine the application address.",
        nextPath,
      ),
    );
  }

  const callbackUrl = new URL("/v2/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      loginErrorUrl(
        "Google sign-in could not be started. Please try again.",
        nextPath,
      ),
    );
  }

  redirect(data.url);
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect(loginErrorUrl("Email and password are required.", nextPath));
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      loginErrorUrl("The email or password was not accepted.", nextPath),
    );
  }

  redirect(nextPath);
}
