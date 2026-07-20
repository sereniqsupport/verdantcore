import type { InvestoModelUsage } from "@/lib/investo/ai/usage";

export type InvestoAIProvider =
  | "openai"
  | "anthropic";

export type InvestoModelPurpose =
  | "company_research"
  | "financial_analysis"
  | "valuation"
  | "portfolio_analysis"
  | "risk_review"
  | "thesis_challenge"
  | "investment_committee"
  | "classification"
  | "summary"
  | "system_health";

export type InvestoModelSelection = {
  provider: InvestoAIProvider;
  model: string;
  reasoningEffort: "low" | "medium" | "high";
  role:
    | "primary_analysis"
    | "independent_review"
    | "final_synthesis";
};

export type InvestoAgentEvidence = {
  title: string;
  source?: string;
  sourceUrl?: string;
  publishedAt?: string;
  dataAsOf?: string;
  note?: string;
};

export type InvestoAgentResult<T> = {
  agentName: string;
  provider: InvestoAIProvider;
  model: string;
  promptVersion: string;
  output: T;
  evidence: InvestoAgentEvidence[];
  usage: InvestoModelUsage;
};

export type InvestoDualReviewResult = {
  primary: InvestoAgentResult<string>;
  independentReview: InvestoAgentResult<string>;
  agreementStatus:
    | "agreement_not_yet_assessed"
    | "material_agreement"
    | "qualified_agreement"
    | "material_disagreement";
};
