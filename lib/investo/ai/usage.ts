import {
  INVESTO_STANDARD_RESEARCH_LIMITS,
} from "@/lib/investo/ai/resource-profiles";

export type InvestoModelUsage = {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  estimatedCostUsd: number | null;
};

export type InvestoResearchUsage = {
  modelCalls: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  estimatedCostUsd: number | null;
};

export function createEmptyModelUsage(): InvestoModelUsage {
  return {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    durationMs: 0,
    estimatedCostUsd: null,
  };
}

export function aggregateInvestoUsage(
  usages: InvestoModelUsage[],
): InvestoResearchUsage {
  const initialUsage: InvestoResearchUsage = {
    modelCalls: 0,
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    durationMs: 0,
    estimatedCostUsd: 0,
  };

  const aggregated = usages.reduce<InvestoResearchUsage>(
    (total, usage) => ({
      modelCalls: total.modelCalls + 1,
      inputTokens:
        total.inputTokens + usage.inputTokens,
      cachedInputTokens:
        total.cachedInputTokens +
        usage.cachedInputTokens,
      outputTokens:
        total.outputTokens + usage.outputTokens,
      totalTokens:
        total.totalTokens + usage.totalTokens,
      durationMs:
        total.durationMs + usage.durationMs,
      estimatedCostUsd:
        total.estimatedCostUsd !== null &&
        usage.estimatedCostUsd !== null
          ? total.estimatedCostUsd +
            usage.estimatedCostUsd
          : null,
    }),
    initialUsage,
  );

  if (
    usages.some(
      (usage) => usage.estimatedCostUsd === null,
    )
  ) {
    aggregated.estimatedCostUsd = null;
  }

  return aggregated;
}

export function enforceResearchUsageBudget(
  usage: InvestoResearchUsage,
) {
  if (
    usage.modelCalls >
    INVESTO_STANDARD_RESEARCH_LIMITS.maximumModelCalls
  ) {
    throw new Error(
      "The research run exceeded the permitted model-call limit.",
    );
  }

  if (
    usage.outputTokens >
    INVESTO_STANDARD_RESEARCH_LIMITS
      .maximumCombinedOutputTokens
  ) {
    throw new Error(
      "The research run exceeded the permitted output-token limit.",
    );
  }
}
