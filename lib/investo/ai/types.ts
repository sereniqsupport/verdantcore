export type InvestoModelPurpose =
  | "research"
  | "risk_review"
  | "investment_committee"
  | "classification"
  | "summary";

export type InvestoModelSelection = {
  model: string;
  reasoningEffort: "low" | "medium" | "high";
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
  model: string;
  promptVersion: string;
  output: T;
  evidence: InvestoAgentEvidence[];
};
