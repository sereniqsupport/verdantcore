export type ResearchHumanAction =
  "add_to_watchlist" | "send_to_decision_queue" | "record_no_action";

export type SavedResearchSummary = {
  id: string;
  symbol: string;
  title: string;
  executiveSummary: string | null;
  conclusion: string;
  proposedAction: string;
  createdAt: string;
};

export type HumanActionResult = {
  action: ResearchHumanAction;
  researchReportId: string;
  recommendationId?: string;
  decisionId?: string;
  watchlistId?: string;
  transactionExecuted: false;
};
