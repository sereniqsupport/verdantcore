import "server-only";

import type {
  SupabaseClient,
} from "@supabase/supabase-js";
import type {
  InvestoResearchUsage,
} from "@/lib/investo/ai/usage";

type RecordInvestoUsageInput = {
  supabase: SupabaseClient;
  runId: string;
  agentVersion: string;
  resourceProfile: string;
  usage: InvestoResearchUsage;
  usageDetails: unknown;
};

export async function recordInvestoAgentUsage({
  supabase,
  runId,
  agentVersion,
  resourceProfile,
  usage,
  usageDetails,
}: RecordInvestoUsageInput) {
  const { error } = await supabase
    .from("investo_agent_runs")
    .update({
      agent_version: agentVersion,
      resource_profile: resourceProfile,
      model_calls: usage.modelCalls,
      input_tokens: usage.inputTokens,
      cached_input_tokens:
        usage.cachedInputTokens,
      output_tokens: usage.outputTokens,
      total_tokens: usage.totalTokens,
      duration_ms: usage.durationMs,
      estimated_cost_usd:
        usage.estimatedCostUsd,
      usage_details: usageDetails,
    })
    .eq("id", runId);

  if (error) {
    throw new Error(
      `Unable to record Investo model usage: ${error.message}`,
    );
  }
}
