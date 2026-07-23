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
    .select("id, portfolio_id, symbol, action, status, decision_note, executed_at")
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

  if (action === "executed") {
    const quantityValue = readOptionalString(formData, "quantity");
    const priceValue = readOptionalString(formData, "execution_price");

    const quantity =
      quantityValue === null ? null : Number(quantityValue);

    const executionPrice =
      priceValue === null ? null : Number(priceValue);

    if (
      quantity !== null &&
      (!Number.isFinite(quantity) || quantity <= 0)
    ) {
      throw new Error("Execution quantity must be greater than zero.");
    }

    if (
      executionPrice !== null &&
      (!Number.isFinite(executionPrice) || executionPrice <= 0)
    ) {
      throw new Error("Execution price must be greater than zero.");
    }

    const totalValue =
      quantity !== null && executionPrice !== null
        ? quantity * executionPrice
        : null;

    const actionTypeMap: Record<string, string> = {
      buy: "buy",
      sell: "sell",
      add: "add",
      trim: "trim",
      exit: "exit",
      hold: "hold",
      watch: "watch",
      no_action: "no_action",
      record_no_action: "no_action",
    };

    const actionType =
      actionTypeMap[existing.data.action] ?? "hold";

    const ledgerResult = await supabase
      .from("investo_portfolio_actions")
      .insert({
        user_id: user.id,
        portfolio_id: existing.data.portfolio_id,
        decision_id: existing.data.id,
        symbol: existing.data.symbol,
        action_type: actionType,
        quantity,
        execution_price: executionPrice,
        total_value: totalValue,
        execution_note:
          decisionNote ??
          existing.data.decision_note ??
          "Execution recorded manually.",
        executed_at: new Date().toISOString(),
      });

    if (ledgerResult.error) {
      throw new Error(ledgerResult.error.message);
    }
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
