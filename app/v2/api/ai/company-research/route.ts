import { NextResponse } from "next/server";

import {
  beginInvestoAgentRun,
  completeInvestoAgentRun,
  failInvestoAgentRun,
} from "@/lib/investo/ai/audit";
import {
  hasCompleteInvestoAIConfiguration,
  INVESTO_ANTHROPIC_MODEL,
  INVESTO_OPENAI_MODEL,
  INVESTO_PROMPT_VERSION,
} from "@/lib/investo/ai/config";
import { recordInvestoAgentUsage } from "@/lib/investo/ai/usage-audit";
import { runCompanyResearchPipeline } from "@/lib/investo/agents/company-research-agent";
import { validateCompanyResearchRequest } from "@/lib/investo/agents/company-research-validation";
import { requireInvestoUser } from "@/lib/investo/auth";
import {
  beginInvestoOperationsActivity,
  completeInvestoOperationsActivity,
  failInvestoOperationsActivity,
  getInvestoRuntimeControl,
} from "@/lib/investo/operations/control";
import { saveCompletedResearch } from "@/lib/investo/research/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { supabase, user } = await requireInvestoUser();

  const runtimeControl = await getInvestoRuntimeControl(supabase, user.id);

  if (runtimeControl.status !== "running") {
    return NextResponse.json(
      {
        application: "Investo",
        status: "automation_not_running",
        runtimeStatus: runtimeControl.status,
        message:
          runtimeControl.status === "paused"
            ? "Investo research is paused. Resume operations before starting new research."
            : "Investo research is stopped. Start operations before starting new research.",
        executionMode: "human-approved",
        transactionExecuted: false,
      },
      {
        status: 423,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!hasCompleteInvestoAIConfiguration()) {
    return NextResponse.json(
      {
        application: "Investo",
        status: "not_configured",
        message:
          "Both server-side AI provider keys are required before company research can run.",
        requiredConfiguration: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY"],
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        status: "invalid_request",
        message: "The request body must be valid JSON.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  let input;

  try {
    input = validateCompanyResearchRequest(body);
  } catch (error) {
    return NextResponse.json(
      {
        status: "invalid_request",
        message:
          error instanceof Error
            ? error.message
            : "The company research request is invalid.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const operationsStartedAt = Date.now();

  let runId: string | null = null;
  let operationsActivityId: string | null = null;

  try {
    operationsActivityId = await beginInvestoOperationsActivity({
      supabase,
      userId: user.id,
      agentName: "company-research-committee",
      subject: input.ticker?.trim().toUpperCase() || input.companyName.trim(),
    });

    runId = await beginInvestoAgentRun({
      supabase,
      userId: user.id,
      agentName: "company-research-committee",
      runType: "dual_model_company_research",
      inputSummary: [
        `Company: ${input.companyName}`,
        `Ticker: ${input.ticker ?? "not provided"}`,
        `Evidence records: ${input.evidence.length}`,
      ].join("; "),
      modelName: `${INVESTO_OPENAI_MODEL} + ${INVESTO_ANTHROPIC_MODEL}`,
      promptVersion: INVESTO_PROMPT_VERSION,
    });

    const result = await runCompanyResearchPipeline(input);

    await recordInvestoAgentUsage({
      supabase,
      runId,
      agentVersion: "investo-agent-v1",
      resourceProfile: "company-research-standard-v1",
      usage: result.usage,
      usageDetails: {
        primaryAnalysis: result.primaryAnalysis.usage,
        independentReview: result.independentReview.usage,
        committee: result.committee.usage,
      },
    });

    await completeInvestoAgentRun({
      supabase,
      runId,
      outputSummary: JSON.stringify({
        companyName: result.committee.output.companyName,
        ticker: result.committee.output.ticker,
        conclusion: result.committee.output.conclusion,
        agreement: result.committee.output.modelAgreement.status,
        proposedHumanAction: result.committee.output.proposedHumanAction.action,
        humanApprovalRequired: true,
        transactionExecuted: false,
      }),
      evidence: input.evidence,
    });

    await completeInvestoOperationsActivity({
      supabase,
      activityId: operationsActivityId,
      startedAt: operationsStartedAt,
    });

    const savedReport = await saveCompletedResearch({
      supabase,
      userId: user.id,
      evidence: input.evidence,
      result,
    });

    return NextResponse.json(
      {
        application: "Investo",
        status: "completed",
        executionMode: "human-approved",
        research: result,
        savedReport,
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
        : "The company research pipeline failed.";

    await failInvestoOperationsActivity({
      supabase,
      activityId: operationsActivityId,
      startedAt: operationsStartedAt,
      errorMessage: message,
    });

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
        status: "failed",
        message,
        executionMode: "human-approved",
        transactionExecuted: false,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
