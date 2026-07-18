import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvestoAgentEvidence } from "@/lib/investo/ai/types";

type BeginAgentRunInput = {
  supabase: SupabaseClient;
  userId: string;
  agentName: string;
  runType: string;
  inputSummary: string;
  modelName: string;
  promptVersion: string;
};

export async function beginInvestoAgentRun({
  supabase,
  userId,
  agentName,
  runType,
  inputSummary,
  modelName,
  promptVersion,
}: BeginAgentRunInput) {
  const result = await supabase
    .from("investo_agent_runs")
    .insert({
      user_id: userId,
      agent_name: agentName,
      run_type: runType,
      status: "running",
      input_summary: inputSummary,
      model_name: modelName,
      prompt_version: promptVersion,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (result.error || !result.data) {
    throw new Error(
      result.error?.message ??
        "The Investo agent audit record could not be created.",
    );
  }

  return result.data.id as string;
}

type CompleteAgentRunInput = {
  supabase: SupabaseClient;
  runId: string;
  outputSummary: string;
  evidence?: InvestoAgentEvidence[];
};

export async function completeInvestoAgentRun({
  supabase,
  runId,
  outputSummary,
  evidence = [],
}: CompleteAgentRunInput) {
  const result = await supabase
    .from("investo_agent_runs")
    .update({
      status: "completed",
      output_summary: outputSummary,
      evidence,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

type FailAgentRunInput = {
  supabase: SupabaseClient;
  runId: string;
  errorMessage: string;
};

export async function failInvestoAgentRun({
  supabase,
  runId,
  errorMessage,
}: FailAgentRunInput) {
  const result = await supabase
    .from("investo_agent_runs")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 2000),
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (result.error) {
    console.error(
      "Investo could not finalize the failed agent audit record:",
      result.error.message,
    );
  }
}
