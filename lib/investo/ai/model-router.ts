import {
  INVESTO_DEEP_REVIEW_MODEL,
  INVESTO_PRIMARY_MODEL,
} from "@/lib/investo/ai/config";
import type {
  InvestoModelPurpose,
  InvestoModelSelection,
} from "@/lib/investo/ai/types";

export function selectInvestoModel(
  purpose: InvestoModelPurpose,
): InvestoModelSelection {
  switch (purpose) {
    case "investment_committee":
      return {
        model: INVESTO_DEEP_REVIEW_MODEL,
        reasoningEffort: "high",
      };

    case "research":
    case "risk_review":
      return {
        model: INVESTO_PRIMARY_MODEL,
        reasoningEffort: "high",
      };

    case "classification":
    case "summary":
      return {
        model: INVESTO_PRIMARY_MODEL,
        reasoningEffort: "low",
      };

    default: {
      const exhaustiveCheck: never = purpose;
      throw new Error(
        `Unsupported Investo model purpose: ${exhaustiveCheck}`,
      );
    }
  }
}
