export const INVESTO_SKILLS = {
  businessModelAnalysis: {
    id: "business-model-analysis",
    name: "Business Model Analysis",
    description:
      "Assess how a company creates value, earns revenue, and sustains cash generation.",
  },

  financialStatementReview: {
    id: "financial-statement-review",
    name: "Financial Statement Review",
    description:
      "Assess revenue, margins, cash flow, debt, liquidity, and balance-sheet strength.",
  },

  competitivePositionAssessment: {
    id: "competitive-position-assessment",
    name: "Competitive Position Assessment",
    description:
      "Identify durable advantages, competitive pressure, and displacement risk.",
  },

  capitalAllocationReview: {
    id: "capital-allocation-review",
    name: "Capital Allocation Review",
    description:
      "Assess reinvestment, acquisitions, debt management, repurchases, and dividends.",
  },

  valuationReadiness: {
    id: "valuation-readiness",
    name: "Valuation Readiness",
    description:
      "Determine whether sufficient evidence exists to conduct disciplined valuation work.",
  },

  evidenceGapIdentification: {
    id: "evidence-gap-identification",
    name: "Evidence Gap Identification",
    description:
      "Identify missing, stale, contradictory, or unsupported evidence.",
  },

  downsideAnalysis: {
    id: "downside-analysis",
    name: "Downside Analysis",
    description:
      "Assess material downside scenarios and conditions that could impair capital.",
  },

  assumptionTesting: {
    id: "assumption-testing",
    name: "Assumption Testing",
    description:
      "Challenge unsupported assumptions and optimistic interpretations.",
  },

  accountingQualityReview: {
    id: "accounting-quality-review",
    name: "Accounting Quality Review",
    description:
      "Identify earnings-quality, cash-conversion, and reporting concerns.",
  },

  concentrationRiskReview: {
    id: "concentration-risk-review",
    name: "Concentration Risk Review",
    description:
      "Assess customer, supplier, product, geographic, and platform concentration.",
  },

  thesisBreakerIdentification: {
    id: "thesis-breaker-identification",
    name: "Thesis Breaker Identification",
    description:
      "Define evidence or events that would invalidate the investment thesis.",
  },

  evidenceReconciliation: {
    id: "evidence-reconciliation",
    name: "Evidence Reconciliation",
    description:
      "Reconcile supported facts, conflicting interpretations, and unresolved uncertainty.",
  },

  modelDisagreementAssessment: {
    id: "model-disagreement-assessment",
    name: "Model Disagreement Assessment",
    description:
      "Identify and preserve material disagreement between independent reviews.",
  },

  humanActionPreparation: {
    id: "human-action-preparation",
    name: "Human Action Preparation",
    description:
      "Prepare a reviewable action and required conditions without granting execution authority.",
  },

  structuredDecisionPreparation: {
    id: "structured-decision-preparation",
    name: "Structured Decision Preparation",
    description:
      "Produce a validated, machine-readable committee conclusion.",
  },
} as const;

export type InvestoSkillId =
  (typeof INVESTO_SKILLS)[keyof typeof INVESTO_SKILLS]["id"];
