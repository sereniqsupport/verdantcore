import "server-only";

import {
  INVESTO_INDEPENDENT_REVIEW_POLICY,
  INVESTO_PRIMARY_ANALYST_POLICY,
} from "@/lib/investo/ai/prompts";
import { runInvestoModel } from "@/lib/investo/ai/provider";
import type {
  InvestoAgentEvidence,
  InvestoDualReviewResult,
} from "@/lib/investo/ai/types";

type RunDualReviewInput = {
  subject: string;
  primaryPurpose:
    | "company_research"
    | "financial_analysis"
    | "valuation"
    | "portfolio_analysis";
  instruction: string;
  evidence?: InvestoAgentEvidence[];
};

export async function runInvestoDualReview({
  subject,
  primaryPurpose,
  instruction,
  evidence = [],
}: RunDualReviewInput): Promise<InvestoDualReviewResult> {
  const primary = await runInvestoModel({
    agentName: `${primaryPurpose}-primary`,
    purpose: primaryPurpose,
    instruction,
    additionalPolicy: INVESTO_PRIMARY_ANALYST_POLICY,
    evidence,
    providerOverride: "openai",
  });

  const independentReviewInstruction = `
Subject under review:
${subject}

Primary analysis prepared by GPT-5.6 Sol:
${primary.output}

Independently examine the primary analysis. Challenge its assumptions,
identify missing evidence, explain material risks, and state where you
agree or disagree. Do not rewrite it merely for style.
`.trim();

  const independentReview = await runInvestoModel({
    agentName: `${primaryPurpose}-independent-review`,
    purpose: "thesis_challenge",
    instruction: independentReviewInstruction,
    additionalPolicy: INVESTO_INDEPENDENT_REVIEW_POLICY,
    evidence,
    providerOverride: "anthropic",
  });

  return {
    primary,
    independentReview,
    agreementStatus: "agreement_not_yet_assessed",
  };
}
