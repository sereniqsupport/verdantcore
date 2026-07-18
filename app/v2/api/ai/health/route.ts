import { NextResponse } from "next/server";
import { requireInvestoUser } from "@/lib/investo/auth";
import {
  hasOpenAIConfiguration,
  INVESTO_PRIMARY_MODEL,
  INVESTO_PROMPT_VERSION,
} from "@/lib/investo/ai/config";
import { INVESTO_HEALTH_PROMPT } from "@/lib/investo/ai/prompts";
import { runInvestoModel } from "@/lib/investo/ai/provider";
import {
  beginInvestoAgentRun,
  completeInvestoAgentRun,
  failInvestoAgentRun,
} from "@/lib/investo/ai/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, user } = await requireInvestoUser();

  if (!hasOpenAIConfiguration()) {
    return NextResponse.json(
      {
        application: "Investo",
        authentication: "verified",
        ai: "not_configured",
        model: INVESTO_PRIMARY_MODEL,
        promptVersion: INVESTO_PROMPT_VERSION,
        message:
          "OPENAI_API_KEY is not configured in the server environment.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let runId: string | null = null;

  try {
    runId = await beginInvestoAgentRun({
      supabase,
      userId: user.id,
      agentName: "system-health",
      runType: "connection_test",
      inputSummary: "Verify the private Investo model connection.",
      modelName: INVESTO_PRIMARY_MODEL,
      promptVersion: INVESTO_PROMPT_VERSION,
    });

    const result = await runInvestoModel({
      agentName: "system-health",
      purpose: "summary",
      instruction: INVESTO_HEALTH_PROMPT,
    });

    await completeInvestoAgentRun({
      supabase,
      runId,
      outputSummary: result.output,
    });

    return NextResponse.json(
      {
        application: "Investo",
        authentication: "verified",
        ai: "available",
        model: result.model,
        promptVersion: result.promptVersion,
        message: result.output,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Investo model connection error.";

    if (runId) {
      await failInvestoAgentRun({
        supabase,
        runId,
        errorMessage: message,
      });
    }

    return NextResponse.json(
      {
        application: "Investo",
        authentication: "verified",
        ai: "unavailable",
        model: INVESTO_PRIMARY_MODEL,
        promptVersion: INVESTO_PROMPT_VERSION,
        message,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
