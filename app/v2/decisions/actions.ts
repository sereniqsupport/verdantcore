"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DECISION_TABLE = "investo_decisions";

type DecisionAction = "approved" | "rejected" | "executed";

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value.trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/v2/login?next=%2Fv2%2Fdecisions");
  }

  return {
    supabase,
    user,
  };
}

async function updateDecision(
  formData: FormData,
  action: DecisionAction,
) {
  const decisionId = readRequiredString(formData, "decision_id");
  const decisionNote = readOptionalString(formData, "decision_note");
  const { supabase, user } = await requireAuthenticatedUser();

  const existing = await supabase
    .from(DECISION_TABLE)
    .select("id, status, decision_note, executed_at")
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (!existing.data) {
    throw new Error("Decision was not found.");
  }

  if (action === "executed" && existing.data.status !== "approved") {
    throw new Error("Only approved decisions can be recorded as executed.");
  }

  if (
    (action === "approved" || action === "rejected") &&
    existing.data.status !== "prepared"
  ) {
    throw new Error("Only prepared decisions can be reviewed.");
  }

  const update =
    action === "executed"
      ? {
          status: "executed",
          executed_at: new Date().toISOString(),
          decision_note:
            decisionNote ??
            existing.data.decision_note ??
            "Execution recorded manually.",
        }
      : {
          status: action,
          decision_note:
            decisionNote ??
            existing.data.decision_note ??
            (action === "approved"
              ? "Approved after human review."
              : "Rejected after human review."),
        };

  const result = await supabase
    .from(DECISION_TABLE)
    .update(update)
    .eq("id", decisionId)
    .eq("user_id", user.id);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/decisions");
  revalidatePath("/v2/portfolio");
}

export async function approveDecision(formData: FormData) {
  await updateDecision(formData, "approved");
}

export async function rejectDecision(formData: FormData) {
  await updateDecision(formData, "rejected");
}

export async function recordDecisionExecution(formData: FormData) {
  await updateDecision(formData, "executed");
}
