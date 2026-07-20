import type { InvestoAgentEvidence } from "@/lib/investo/ai/types";
import type {
  InvestoModelUsage,
  InvestoResearchUsage,
} from "@/lib/investo/ai/usage";

export type CompanyResearchRequest = {
  companyName: string;
  ticker?: string;
  researchQuestion?: string;
  evidence: InvestoAgentEvidence[];
};

export type ResearchConclusion =
  | "attractive"
  | "watch"
  | "insufficient_evidence"
  | "avoid";

export type AgreementAssessment =
  | "material_agreement"
  | "qualified_agreement"
  | "material_disagreement";

export type HumanAction =
  | "continue_research"
  | "add_to_watchlist"
  | "prepare_valuation"
  | "consider_initial_position"
  | "consider_addition"
  | "hold"
  | "avoid"
  | "no_action";

export type CompanyResearchCommitteeOutput = {
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
    status:
      | "ready"
      | "partially_ready"
      | "not_ready";
    missingInputs: string[];
  };

  principalRisks: string[];
  thesisBreakers: string[];
  missingEvidence: string[];

  modelAgreement: {
    status: AgreementAssessment;
    agreedPoints: string[];
    disputedPoints: string[];
  };

  conclusion: ResearchConclusion;

  proposedHumanAction: {
    action: HumanAction;
    rationale: string;
    conditionsBeforeAction: string[];
  };

  authorityBoundary: {
    humanApprovalRequired: true;
    transactionExecuted: false;
  };
};

export type CompanyResearchPipelineResult = {
  primaryAnalysis: {
    provider: string;
    model: string;
    output: string;
    usage: InvestoModelUsage;
  };

  independentReview: {
    provider: string;
    model: string;
    output: string;
    usage: InvestoModelUsage;
  };

  committee: {
    provider: string;
    model: string;
    output: CompanyResearchCommitteeOutput;
    usage: InvestoModelUsage;
  };

  usage: InvestoResearchUsage;
};
