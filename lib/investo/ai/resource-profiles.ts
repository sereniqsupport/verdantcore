export type InvestoResourceProfileId =
  | "company-primary-standard"
  | "risk-review-standard"
  | "committee-standard";

export type InvestoResourceProfile = {
  id: InvestoResourceProfileId;
  maxOutputTokens: number;
  timeoutMs: number;
  maxRetries: number;
  maximumCallsPerRun: number;
  reasoningEffort: "low" | "medium" | "high";
};

export const INVESTO_RESOURCE_PROFILES: Record<
  InvestoResourceProfileId,
  InvestoResourceProfile
> = {
  "company-primary-standard": {
    id: "company-primary-standard",
    maxOutputTokens: 5000,
    timeoutMs: 120000,
    maxRetries: 1,
    maximumCallsPerRun: 1,
    reasoningEffort: "high",
  },

  "risk-review-standard": {
    id: "risk-review-standard",
    maxOutputTokens: 4000,
    timeoutMs: 120000,
    maxRetries: 1,
    maximumCallsPerRun: 1,
    reasoningEffort: "high",
  },

  "committee-standard": {
    id: "committee-standard",
    maxOutputTokens: 3500,
    timeoutMs: 120000,
    maxRetries: 1,
    maximumCallsPerRun: 1,
    reasoningEffort: "high",
  },
};

export const INVESTO_STANDARD_RESEARCH_LIMITS = {
  maximumModelCalls: 3,
  maximumCombinedOutputTokens: 12500,
  maximumCommitteeCycles: 1,
  automaticTradingAllowed: false,
  humanApprovalRequired: true,
} as const;

export function getInvestoResourceProfile(
  profileId: InvestoResourceProfileId,
) {
  return INVESTO_RESOURCE_PROFILES[profileId];
}
