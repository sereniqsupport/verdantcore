import "server-only";

import {
  getInvestoAnthropicClient,
  getInvestoOpenAIClient,
} from "@/lib/investo/ai/client";
import { INVESTO_PROMPT_VERSION } from "@/lib/investo/ai/config";
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
};

async function runOpenAIModel(
  model: string,
  reasoningEffort: "low" | "medium" | "high",
  instruction: string,
  additionalPolicy?: string,
) {
  const client = getInvestoOpenAIClient();

  const response = await client.responses.create({
    model,
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

  return output;
}

async function runAnthropicModel(
  model: string,
  instruction: string,
  additionalPolicy?: string,
) {
  const client = getInvestoAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: 12000,
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

  return output;
}

export async function runInvestoModel({
  agentName,
  purpose,
  instruction,
  additionalPolicy,
  evidence = [],
  providerOverride,
}: RunInvestoModelInput): Promise<InvestoAgentResult<string>> {
  const routedSelection = selectInvestoModel(purpose);

  const provider =
    providerOverride ?? routedSelection.provider;

  const model =
    provider === "openai"
      ? process.env.INVESTO_OPENAI_MODEL?.trim() ||
        "gpt-5.6-sol"
      : process.env.INVESTO_ANTHROPIC_MODEL?.trim() ||
        "claude-opus-4-8";

  const output =
    provider === "openai"
      ? await runOpenAIModel(
          model,
          routedSelection.reasoningEffort,
          instruction,
          additionalPolicy,
        )
      : await runAnthropicModel(
          model,
          instruction,
          additionalPolicy,
        );

  return {
    agentName,
    provider,
    model,
    promptVersion: INVESTO_PROMPT_VERSION,
    output,
    evidence,
  };
}
