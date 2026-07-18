import { NextResponse } from "next/server";
import {
  hasAnthropicConfiguration,
  hasCompleteInvestoAIConfiguration,
  hasOpenAIConfiguration,
  INVESTO_ANTHROPIC_MODEL,
  INVESTO_DUAL_REVIEW_ENABLED,
  INVESTO_OPENAI_MODEL,
  INVESTO_PROMPT_VERSION,
} from "@/lib/investo/ai/config";

export function GET() {
  return NextResponse.json(
    {
      application: "Investo",
      status: "available",
      executionMode: "human-approved",
      ai: {
        architecture: "dual-model-independent-review",
        fullyConfigured:
          hasCompleteInvestoAIConfiguration(),
        dualReviewEnabled:
          INVESTO_DUAL_REVIEW_ENABLED,
        primaryAnalyst: {
          provider: "OpenAI",
          configured: hasOpenAIConfiguration(),
          model: INVESTO_OPENAI_MODEL,
          responsibilities: [
            "company research",
            "financial analysis",
            "valuation",
            "portfolio analysis",
            "final synthesis",
          ],
        },
        independentReviewer: {
          provider: "Anthropic",
          configured: hasAnthropicConfiguration(),
          model: INVESTO_ANTHROPIC_MODEL,
          responsibilities: [
            "risk review",
            "thesis challenge",
            "assumption testing",
            "independent judgment",
          ],
        },
        promptVersion: INVESTO_PROMPT_VERSION,
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
