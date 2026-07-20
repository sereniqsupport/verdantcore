export type EvidenceDraft = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  dataAsOf: string;
  note: string;
};

export type CommitteeOutput = {
  companyName: string;
  ticker: string | null;
  analysisDate: string;
  evidenceAsOf: string | null;
  executiveSummary: string;
  businessDescription: string;

  businessQuality: {
    assessment: "strong" | "mixed" | "weak" | "unclear";
    rationale: string;
  };

  competitivePosition: {
    assessment: "durable" | "moderate" | "fragile" | "unclear";
    advantages: string[];
    vulnerabilities: string[];
  };

  financialStrength: {
    assessment: "strong" | "mixed" | "weak" | "unclear";
    strengths: string[];
    concerns: string[];
  };

  capitalAllocation: {
    assessment: "disciplined" | "mixed" | "poor" | "unclear";
    rationale: string;
  };

  valuationReadiness: {
    status: "ready" | "partially_ready" | "not_ready";
    missingInputs: string[];
  };

  principalRisks: string[];
  thesisBreakers: string[];
  missingEvidence: string[];

  modelAgreement: {
    status:
      "material_agreement" | "qualified_agreement" | "material_disagreement";
    agreedPoints: string[];
    disputedPoints: string[];
  };

  conclusion: "attractive" | "watch" | "insufficient_evidence" | "avoid";

  proposedHumanAction: {
    action:
      | "continue_research"
      | "add_to_watchlist"
      | "prepare_valuation"
      | "consider_initial_position"
      | "consider_addition"
      | "hold"
      | "avoid"
      | "no_action";
    rationale: string;
    conditionsBeforeAction: string[];
  };

  authorityBoundary: {
    humanApprovalRequired: true;
    transactionExecuted: false;
  };
};

export type CompanyResearchResponse = {
  savedReport: SavedResearchReportResponse;
  application: string;
  status: "completed";
  executionMode: "human-approved";

  research: {
    primaryAnalysis: {
      provider: string;
      model: string;
      output: string;
    };

    independentReview: {
      provider: string;
      model: string;
      output: string;
    };

    committee: {
      provider: string;
      model: string;
      output: CommitteeOutput;
    };
  };
};

export type ResearchErrorResponse = {
  status?: string;
  message?: string;
  requiredConfiguration?: string[];
};

export type SavedResearchReportResponse = {
  id: string;
  symbol: string;
  title: string;
  executive_summary: string | null;
  created_at: string;
};

export type ResearchHumanActionName =
  "add_to_watchlist" | "send_to_decision_queue" | "record_no_action";
