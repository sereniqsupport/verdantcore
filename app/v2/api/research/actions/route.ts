import { NextResponse } from "next/server";
import { requireInvestoUser } from "@/lib/investo/auth";
import { recordResearchHumanAction } from "@/lib/investo/research/repository";
import type { ResearchHumanAction } from "@/lib/investo/research/types";

const allowedActions = new Set<ResearchHumanAction>([
  "add_to_watchlist",
  "send_to_decision_queue",
  "record_no_action",
]);

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireInvestoUser();

    const body = (await request.json()) as {
      reportId?: unknown;
      action?: unknown;
      note?: unknown;
    };

    if (
      typeof body.reportId !== "string" ||
      body.reportId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          status: "invalid_request",
          message: "A valid research report is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof body.action !== "string" ||
      !allowedActions.has(body.action as ResearchHumanAction)
    ) {
      return NextResponse.json(
        {
          status: "invalid_request",
          message: "A valid human action is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await recordResearchHumanAction({
      supabase,
      userId: user.id,
      reportId: body.reportId,
      action: body.action as ResearchHumanAction,
      note:
        typeof body.note === "string"
          ? body.note.trim().slice(0, 4000)
          : undefined,
    });

    return NextResponse.json({
      status: "completed",
      humanApprovalRecorded: true,
      transactionExecuted: false,
      result,
    });
  } catch (error) {
    console.error("Investo research action failed:", error);

    return NextResponse.json(
      {
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "The action could not be recorded.",
        transactionExecuted: false,
      },
      {
        status: 500,
      },
    );
  }
}
