import {
  INVESTO_ANTHROPIC_MODEL,
  INVESTO_OPENAI_MODEL,
} from "@/lib/investo/ai/config";
import type {
  InvestoModelPurpose,
  InvestoModelSelection,
} from "@/lib/investo/ai/types";

export function selectInvestoModel(
  purpose: InvestoModelPurpose,
): InvestoModelSelection {
  switch (purpose) {
    case "company_research":
    case "financial_analysis":
    case "valuation":
    case "portfolio_analysis":
      return {
        provider: "openai",
        model: INVESTO_OPENAI_MODEL,
        reasoningEffort: "high",
        role: "primary_analysis",
      };

    case "risk_review":
    case "thesis_challenge":
      return {
        provider: "anthropic",
        model: INVESTO_ANTHROPIC_MODEL,
        reasoningEffort: "high",
        role: "independent_review",
      };

    case "investment_committee":
      return {
        provider: "openai",
        model: INVESTO_OPENAI_MODEL,
        reasoningEffort: "high",
        role: "final_synthesis",
      };

    case "classification":
    case "summary":
    case "system_health":
      return {
        provider: "openai",
        model: INVESTO_OPENAI_MODEL,
        reasoningEffort: "low",
        role: "primary_analysis",
      };

    default: {
      const exhaustiveCheck: never = purpose;

      throw new Error(
        `Unsupported Investo model purpose: ${exhaustiveCheck}`,
      );
    }
  }
}
