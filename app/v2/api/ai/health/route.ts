import { NextResponse } from "next/server";
import { requireInvestoUser } from "@/lib/investo/auth";
import {
  hasAnthropicConfiguration,
  hasOpenAIConfiguration,
  INVESTO_ANTHROPIC_MODEL,
  INVESTO_OPENAI_MODEL,
  INVESTO_PROMPT_VERSION,
} from "@/lib/investo/ai/config";
import {
  INVESTO_ANTHROPIC_HEALTH_PROMPT,
  INVESTO_OPENAI_HEALTH_PROMPT,
} from "@/lib/investo/ai/prompts";
import { runInvestoModel } from "@/lib/investo/ai/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireInvestoUser();

  const openAIConfigured = hasOpenAIConfiguration();
  const anthropicConfigured = hasAnthropicConfiguration();

  const results: {
    openai: {
      configured: boolean;
      model: string;
      status: string;
      message?: string;
    };
    anthropic: {
      configured: boolean;
      model: string;
      status: string;
      message?: string;
    };
  } = {
    openai: {
      configured: openAIConfigured,
      model: INVESTO_OPENAI_MODEL,
      status: openAIConfigured
        ? "pending"
        : "not_configured",
    },
    anthropic: {
      configured: anthropicConfigured,
      model: INVESTO_ANTHROPIC_MODEL,
      status: anthropicConfigured
        ? "pending"
        : "not_configured",
    },
  };

  if (openAIConfigured) {
    try {
      const response = await runInvestoModel({
        agentName: "openai-system-health",
        purpose: "system_health",
        instruction: INVESTO_OPENAI_HEALTH_PROMPT,
        providerOverride: "openai",
      });

      results.openai.status = "available";
      results.openai.message = response.output;
    } catch (error) {
      results.openai.status = "unavailable";
      results.openai.message =
        error instanceof Error
          ? error.message
          : "Unknown OpenAI connection error.";
    }
  }

  if (anthropicConfigured) {
    try {
      const response = await runInvestoModel({
        agentName: "anthropic-system-health",
        purpose: "system_health",
        instruction: INVESTO_ANTHROPIC_HEALTH_PROMPT,
        providerOverride: "anthropic",
      });

      results.anthropic.status = "available";
      results.anthropic.message = response.output;
    } catch (error) {
      results.anthropic.status = "unavailable";
      results.anthropic.message =
        error instanceof Error
          ? error.message
          : "Unknown Anthropic connection error.";
    }
  }

  const fullyAvailable =
    results.openai.status === "available" &&
    results.anthropic.status === "available";

  return NextResponse.json(
    {
      application: "Investo",
      authentication: "verified",
      architecture: "dual-model-independent-review",
      status: fullyAvailable
        ? "available"
        : "degraded",
      executionMode: "human-approved",
      promptVersion: INVESTO_PROMPT_VERSION,
      providers: results,
      timestamp: new Date().toISOString(),
    },
    {
      status: fullyAvailable ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
