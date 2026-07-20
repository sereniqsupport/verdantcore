import "server-only";

import {
  getInvestoAnthropicClient,
  getInvestoOpenAIClient,
} from "@/lib/investo/ai/client";
import { INVESTO_PROMPT_VERSION } from "@/lib/investo/ai/config";
import {
  getInvestoResourceProfile,
  type InvestoResourceProfileId,
} from "@/lib/investo/ai/resource-profiles";
import type {
  InvestoModelUsage,
} from "@/lib/investo/ai/usage";
import { selectInvestoModel } from "@/lib/investo/ai/model-router";
import { INVESTO_SYSTEM_POLICY } from "@/lib/investo/ai/prompts";
import type {
  InvestoAgentEvidence,
  InvestoAgentResult,
  InvestoAIProvider,
  InvestoModelPurpose,
} from "@/lib/investo/ai/types";

type RunInvestoModelInput = {
  agentName: string;
  purpose: InvestoModelPurpose;
  instruction: string;
  additionalPolicy?: string;
  evidence?: InvestoAgentEvidence[];
  providerOverride?: InvestoAIProvider;
  resourceProfileId?: InvestoResourceProfileId;
};

async function runOpenAIModel(
  model: string,
  reasoningEffort: "low" | "medium" | "high",
  instruction: string,
  maxOutputTokens: number,
  additionalPolicy?: string,
): Promise<{
  output: string;
  usage: InvestoModelUsage;
}> {
  const client = getInvestoOpenAIClient();

  const startedAt = Date.now();

  const response = await client.responses.create({
    model,
    max_output_tokens: maxOutputTokens,
    reasoning: {
      effort: reasoningEffort,
    },
    instructions: [
      INVESTO_SYSTEM_POLICY,
      additionalPolicy,
    ]
      .filter(Boolean)
      .join("\n\n"),
    input: instruction,
  });

  const output = response.output_text?.trim();

  if (!output) {
    throw new Error(
      "GPT-5.6 Sol returned no readable output.",
    );
  }

  const usage = response.usage;

  return {
    output,
    usage: {
      inputTokens: usage?.input_tokens ?? 0,
      cachedInputTokens:
        usage?.input_tokens_details?.cached_tokens ?? 0,
      outputTokens: usage?.output_tokens ?? 0,
      totalTokens: usage?.total_tokens ?? 0,
      durationMs: Date.now() - startedAt,
      estimatedCostUsd: null,
    },
  };
}

async function runAnthropicModel(
  model: string,
  instruction: string,
  maxOutputTokens: number,
  additionalPolicy?: string,
): Promise<{
  output: string;
  usage: InvestoModelUsage;
}> {
  const client = getInvestoAnthropicClient();

  const startedAt = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: maxOutputTokens,
    system: [
      INVESTO_SYSTEM_POLICY,
      additionalPolicy,
    ]
      .filter(Boolean)
      .join("\n\n"),
    messages: [
      {
        role: "user",
        content: instruction,
      },
    ],
  });

  const output = response.content
    .filter(
      (
        block,
      ): block is Extract<
        (typeof response.content)[number],
        { type: "text" }
      > => block.type === "text",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!output) {
    throw new Error(
      "Claude Opus 4.8 returned no readable output.",
    );
  }

  const inputTokens =
    response.usage.input_tokens ?? 0;
  const cachedInputTokens =
    response.usage.cache_read_input_tokens ?? 0;
  const outputTokens =
    response.usage.output_tokens ?? 0;

  return {
    output,
    usage: {
      inputTokens,
      cachedInputTokens,
      outputTokens,
      totalTokens:
        inputTokens +
        cachedInputTokens +
        outputTokens,
      durationMs: Date.now() - startedAt,
      estimatedCostUsd: null,
    },
  };
}

export async function runInvestoModel({
  agentName,
  purpose,
  instruction,
  additionalPolicy,
  evidence = [],
  providerOverride,
  resourceProfileId,
}: RunInvestoModelInput): Promise<InvestoAgentResult<string>> {
  const routedSelection = selectInvestoModel(purpose);

  const resolvedProfileId =
    resourceProfileId ??
    (providerOverride === "anthropic"
      ? "risk-review-standard"
      : purpose === "investment_committee"
        ? "committee-standard"
        : "company-primary-standard");

  const resourceProfile =
    getInvestoResourceProfile(resolvedProfileId);

  const provider =
    providerOverride ?? routedSelection.provider;

  const model =
    provider === "openai"
      ? process.env.INVESTO_OPENAI_MODEL?.trim() ||
        "gpt-5.6-sol"
      : process.env.INVESTO_ANTHROPIC_MODEL?.trim() ||
        "claude-opus-4-8";

  const result =
    provider === "openai"
      ? await runOpenAIModel(
          model,
          resourceProfile.reasoningEffort,
          instruction,
          resourceProfile.maxOutputTokens,
          additionalPolicy,
        )
      : await runAnthropicModel(
          model,
          instruction,
          resourceProfile.maxOutputTokens,
          additionalPolicy,
        );

  if (
    result.usage.outputTokens >
    resourceProfile.maxOutputTokens
  ) {
    throw new Error(
      `${agentName} exceeded its output-token limit.`,
    );
  }

  return {
    agentName,
    provider,
    model,
    promptVersion: INVESTO_PROMPT_VERSION,
    output: result.output,
    evidence,
    usage: result.usage,
  };
}
