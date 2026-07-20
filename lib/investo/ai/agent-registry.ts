import {
  INVESTO_ANTHROPIC_MODEL,
  INVESTO_OPENAI_MODEL,
} from "@/lib/investo/ai/config";
import type {
  InvestoResourceProfileId,
} from "@/lib/investo/ai/resource-profiles";
import {
  INVESTO_SKILLS,
  type InvestoSkillId,
} from "@/lib/investo/ai/skill-catalog";
import type {
  InvestoAIProvider,
} from "@/lib/investo/ai/types";

export type InvestoAgentId =
  | "primary-company-analyst"
  | "independent-risk-reviewer"
  | "investment-committee";

export type InvestoAgentContract = {
  id: InvestoAgentId;
  name: string;
  provider: InvestoAIProvider;
  model: string;
  role: string;
  responsibilities: readonly string[];
  skills: readonly InvestoSkillId[];
  prohibitedActions: readonly string[];
  resourceProfileId: InvestoResourceProfileId;
  version: string;
};

export const INVESTO_AGENT_REGISTRY: Record<
  InvestoAgentId,
  InvestoAgentContract
> = {
  "primary-company-analyst": {
    id: "primary-company-analyst",
    name: "Primary Company Analyst",
    provider: "openai",
    model: INVESTO_OPENAI_MODEL,
    role:
      "Establish the supported facts and prepare the primary company assessment.",
    responsibilities: [
      "Establish supported business and financial facts.",
      "Separate evidence from interpretation.",
      "Assess business quality and financial strength.",
      "Evaluate competitive position and capital allocation.",
      "Identify missing valuation inputs.",
      "Prepare the primary investment thesis.",
    ],
    skills: [
      INVESTO_SKILLS.businessModelAnalysis.id,
      INVESTO_SKILLS.financialStatementReview.id,
      INVESTO_SKILLS.competitivePositionAssessment.id,
      INVESTO_SKILLS.capitalAllocationReview.id,
      INVESTO_SKILLS.valuationReadiness.id,
      INVESTO_SKILLS.evidenceGapIdentification.id,
    ],
    prohibitedActions: [
      "Execute or place a transaction.",
      "Approve a recommendation.",
      "Invent missing financial data.",
      "Conceal uncertainty.",
      "Change holdings or account balances.",
    ],
    resourceProfileId: "company-primary-standard",
    version: "investo-agent-v1",
  },

  "independent-risk-reviewer": {
    id: "independent-risk-reviewer",
    name: "Independent Risk Reviewer",
    provider: "anthropic",
    model: INVESTO_ANTHROPIC_MODEL,
    role:
      "Challenge the primary analysis and identify material downside or unsupported assumptions.",
    responsibilities: [
      "Challenge the primary analysis independently.",
      "Identify unsupported assumptions.",
      "Assess downside and accounting quality.",
      "Surface concentration, governance, and displacement risks.",
      "Define thesis-breaking conditions.",
      "State agreement and disagreement clearly.",
    ],
    skills: [
      INVESTO_SKILLS.assumptionTesting.id,
      INVESTO_SKILLS.downsideAnalysis.id,
      INVESTO_SKILLS.accountingQualityReview.id,
      INVESTO_SKILLS.concentrationRiskReview.id,
      INVESTO_SKILLS.thesisBreakerIdentification.id,
      INVESTO_SKILLS.evidenceGapIdentification.id,
    ],
    prohibitedActions: [
      "Execute or approve a transaction.",
      "Suppress material disagreement.",
      "Introduce unsupported facts.",
      "Rewrite the primary analysis merely for style.",
      "Change holdings or account balances.",
    ],
    resourceProfileId: "risk-review-standard",
    version: "investo-agent-v1",
  },

  "investment-committee": {
    id: "investment-committee",
    name: "Investment Committee",
    provider: "openai",
    model: INVESTO_OPENAI_MODEL,
    role:
      "Reconcile independent reviews and prepare a human-reviewable conclusion.",
    responsibilities: [
      "Reconcile the primary and independent reviews.",
      "Preserve unresolved disagreement.",
      "Assess evidence sufficiency.",
      "Classify the research conclusion.",
      "Prepare one proposed human action.",
      "Define conditions required before action.",
    ],
    skills: [
      INVESTO_SKILLS.evidenceReconciliation.id,
      INVESTO_SKILLS.modelDisagreementAssessment.id,
      INVESTO_SKILLS.humanActionPreparation.id,
      INVESTO_SKILLS.structuredDecisionPreparation.id,
      INVESTO_SKILLS.evidenceGapIdentification.id,
    ],
    prohibitedActions: [
      "Execute or place a transaction.",
      "Mark a transaction as completed.",
      "Bypass human review.",
      "Hide model disagreement.",
      "Change holdings or account balances.",
    ],
    resourceProfileId: "committee-standard",
    version: "investo-agent-v1",
  },
};

export function getInvestoAgentContract(
  agentId: InvestoAgentId,
) {
  return INVESTO_AGENT_REGISTRY[agentId];
}
