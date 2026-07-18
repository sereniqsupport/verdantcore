import { NextResponse } from "next/server";
import {
  hasOpenAIConfiguration,
  INVESTO_DEEP_REVIEW_MODEL,
  INVESTO_PRIMARY_MODEL,
  INVESTO_PROMPT_VERSION,
} from "@/lib/investo/ai/config";

export function GET() {
  return NextResponse.json(
    {
      application: "Investo",
      status: "available",
      executionMode: "human-approved",
      ai: {
        configured: hasOpenAIConfiguration(),
        provider: "OpenAI",
        primaryModel: INVESTO_PRIMARY_MODEL,
        deepReviewModel: INVESTO_DEEP_REVIEW_MODEL,
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
