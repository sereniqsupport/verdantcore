"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResearchHumanActionName } from "@/components/investo/research/types";

type ActionState =
  | {
      status: "idle";
    }
  | {
      status: "saving";
      action: ResearchHumanActionName;
    }
  | {
      status: "completed";
      message: string;
    }
  | {
      status: "failed";
      message: string;
    };

export function ResearchActionPanel({ reportId }: { reportId: string }) {
  const router = useRouter();

  const [state, setState] = useState<ActionState>({
    status: "idle",
  });

  async function submit(action: ResearchHumanActionName) {
    setState({
      status: "saving",
      action,
    });

    try {
      const response = await fetch("/v2/api/research/actions", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          action,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message ?? "The action could not be recorded.");
      }

      const message =
        action === "add_to_watchlist"
          ? "Added to your Watchlist."
          : action === "send_to_decision_queue"
            ? "Prepared in your Decision Queue."
            : "No investment action was approved.";

      setState({
        status: "completed",
        message,
      });

      router.refresh();
    } catch (error) {
      setState({
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "The action could not be recorded.",
      });
    }
  }

  const busy = state.status === "saving";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
        Your Decision
      </p>

      <h3 className="mt-2 text-xl font-semibold text-white">
        Choose what happens next
      </h3>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
        Research is complete. Nothing moves forward until you choose an action.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit("add_to_watchlist")}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white disabled:opacity-40"
        >
          Add to Watchlist
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => submit("send_to_decision_queue")}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"
        >
          Send to Decision Queue
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => submit("record_no_action")}
          className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/45 transition hover:border-white/25 hover:text-white/70 disabled:opacity-40"
        >
          Record No Action
        </button>
      </div>

      {state.status === "saving" ? (
        <p className="mt-4 text-sm text-white/40">Recording your action...</p>
      ) : null}

      {state.status === "completed" ? (
        <p className="mt-4 text-sm text-emerald-200">{state.message}</p>
      ) : null}

      {state.status === "failed" ? (
        <p className="mt-4 text-sm text-red-200">{state.message}</p>
      ) : null}
    </section>
  );
}
