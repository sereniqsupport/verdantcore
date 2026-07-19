import { NextResponse } from "next/server";
import { requireInvestoUser } from "@/lib/investo/auth";
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
import {
  runCompanyResearchPipeline,
} from "@/lib/investo/agents/company-research-agent";
import {
  validateCompanyResearchRequest,
} from "@/lib/investo/agents/company-research-validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { supabase, user } =
    await requireInvestoUser();

  if (!hasCompleteInvestoAIConfiguration()) {
    return NextResponse.json(
      {
        application: "Investo",
        status: "not_configured",
        message:
          "Both server-side AI provider keys are required before company research can run.",
        requiredConfiguration: [
          "OPENAI_API_KEY",
          "ANTHROPIC_API_KEY",
        ],
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

  let runId: string | null = null;

  try {
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
      modelName:
        `${INVESTO_OPENAI_MODEL} + ${INVESTO_ANTHROPIC_MODEL}`,
      promptVersion: INVESTO_PROMPT_VERSION,
    });

    const result =
      await runCompanyResearchPipeline(input);

    await completeInvestoAgentRun({
      supabase,
      runId,
      outputSummary: JSON.stringify({
        companyName:
          result.committee.output.companyName,
        ticker:
          result.committee.output.ticker,
        conclusion:
          result.committee.output.conclusion,
        agreement:
          result.committee.output.modelAgreement.status,
        proposedHumanAction:
          result.committee.output
            .proposedHumanAction.action,
        humanApprovalRequired: true,
        transactionExecuted: false,
      }),
      evidence: input.evidence,
    });

    return NextResponse.json(
      {
        application: "Investo",
        status: "completed",
        executionMode: "human-approved",
        research: result,
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
