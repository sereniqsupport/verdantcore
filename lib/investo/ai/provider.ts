import "server-only";

import { getInvestoOpenAIClient } from "@/lib/investo/ai/client";
import { INVESTO_PROMPT_VERSION } from "@/lib/investo/ai/config";
import { selectInvestoModel } from "@/lib/investo/ai/model-router";
import { INVESTO_SYSTEM_POLICY } from "@/lib/investo/ai/prompts";
import type {
  InvestoAgentEvidence,
  InvestoAgentResult,
  InvestoModelPurpose,
} from "@/lib/investo/ai/types";

type RunInvestoModelInput = {
  agentName: string;
  purpose: InvestoModelPurpose;
  instruction: string;
  evidence?: InvestoAgentEvidence[];
};

export async function runInvestoModel({
  agentName,
  purpose,
  instruction,
  evidence = [],
}: RunInvestoModelInput): Promise<InvestoAgentResult<string>> {
  const client = getInvestoOpenAIClient();
  const selection = selectInvestoModel(purpose);

  const response = await client.responses.create({
    model: selection.model,
    reasoning: {
      effort: selection.reasoningEffort,
    },
    instructions: INVESTO_SYSTEM_POLICY,
    input: instruction,
  });

  const output = response.output_text?.trim();

  if (!output) {
    throw new Error("The Investo model returned no readable output.");
  }

  return {
    agentName,
    model: selection.model,
    promptVersion: INVESTO_PROMPT_VERSION,
    output,
    evidence,
  };
}
