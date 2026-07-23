"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireInvestoUser } from "@/lib/investo/auth";

const DECISION_TABLE = "investo_decisions";

type DecisionReviewAction = "approved" | "rejected";

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
  action: DecisionReviewAction,
) {
  const decisionId = readRequiredString(formData, "decision_id");
  const decisionNote = readOptionalString(formData, "decision_note");
  const { supabase, user } = await requireAuthenticatedUser();

  const existing = await supabase
    .from(DECISION_TABLE)
    .select("id, status, decision_note")
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (!existing.data) {
    throw new Error("Decision was not found.");
  }

  if (existing.data.status !== "prepared") {
    throw new Error("Only prepared decisions can be reviewed.");
  }

  const result = await supabase
    .from(DECISION_TABLE)
    .update({
      status: action,
      decision_note:
        decisionNote ??
        existing.data.decision_note ??
        (action === "approved"
          ? "Approved after human review."
          : "Rejected after human review."),
    })
    .eq("id", decisionId)
    .eq("user_id", user.id)
    .eq("status", "prepared");

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/decisions");
}

export async function approveDecision(formData: FormData) {
  await updateDecision(formData, "approved");
}

export async function rejectDecision(formData: FormData) {
  await updateDecision(formData, "rejected");
}

export async function recordDecisionExecution(
  formData: FormData,
) {
  const { supabase } = await requireInvestoUser();

  const decisionIdValue = formData.get("decision_id");
  const quantityValue = formData.get("quantity");
  const executionPriceValue = formData.get("execution_price");
  const executionNoteValue = formData.get("decision_note");

  if (
    typeof decisionIdValue !== "string" ||
    decisionIdValue.trim().length === 0
  ) {
    throw new Error("A decision is required.");
  }

  if (
    typeof quantityValue !== "string" ||
    quantityValue.trim().length === 0
  ) {
    throw new Error("Execution quantity is required.");
  }

  if (
    typeof executionPriceValue !== "string" ||
    executionPriceValue.trim().length === 0
  ) {
    throw new Error("Execution price is required.");
  }

  const quantity = Number(quantityValue);
  const executionPrice = Number(executionPriceValue);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(
      "Execution quantity must be greater than zero.",
    );
  }

  if (
    !Number.isFinite(executionPrice) ||
    executionPrice <= 0
  ) {
    throw new Error(
      "Execution price must be greater than zero.",
    );
  }

  const executionNote =
    typeof executionNoteValue === "string" &&
    executionNoteValue.trim().length > 0
      ? executionNoteValue.trim()
      : null;

  const rpcClient = supabase as unknown as {
    rpc: (
      functionName: string,
      parameters: Record<string, unknown>,
    ) => Promise<{
      data: unknown;
      error: {
        message: string;
      } | null;
    }>;
  };

  const result = await rpcClient.rpc(
    "investo_record_decision_execution",
    {
      p_decision_id: decisionIdValue.trim(),
      p_quantity: quantity,
      p_execution_price: executionPrice,
      p_execution_note: executionNote,
    },
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/decisions");
  revalidatePath("/v2/portfolio");
}
