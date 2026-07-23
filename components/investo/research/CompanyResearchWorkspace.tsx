"use client";

import { FormEvent, useMemo, useState } from "react";
import { EvidenceEditor } from "@/components/investo/research/EvidenceEditor";
import { ResearchResults } from "@/components/investo/research/ResearchResults";
import { createEvidenceDraft } from "@/components/investo/research/research-format";
import type {
  CompanyResearchResponse,
  EvidenceDraft,
  ResearchErrorResponse,
} from "@/components/investo/research/types";

type ResearchState =
  | {
      status: "idle";
    }
  | {
      status: "running";
    }
  | {
      status: "completed";
      result: CompanyResearchResponse;
    }
  | {
      status: "failed";
      message: string;
    };

function cleanEvidence(evidence: EvidenceDraft[]) {
  return evidence.map((item) => ({
    title: item.title.trim(),
    source: item.source.trim() || undefined,
    sourceUrl: item.sourceUrl.trim() || undefined,
    publishedAt: item.publishedAt.trim() || undefined,
    dataAsOf: item.dataAsOf.trim() || undefined,
    note: item.note.trim() || undefined,
  }));
}

export function CompanyResearchWorkspace({
  initialTicker = "",
}: {
  initialTicker?: string;
}) {
  const [companyName, setCompanyName] = useState("");
  const [ticker, setTicker] = useState(initialTicker);
  const [researchQuestion, setResearchQuestion] = useState("");
  const [evidence, setEvidence] = useState<EvidenceDraft[]>([
    createEvidenceDraft(),
  ]);
  const [researchState, setResearchState] = useState<ResearchState>({
    status: "idle",
  });

  const isRunning = researchState.status === "running";

  const evidenceReady = useMemo(
    () =>
      evidence.length > 0 &&
      evidence.every((item) => item.title.trim().length > 0),
    [evidence],
  );

  const canSubmit =
    companyName.trim().length > 0 && evidenceReady && !isRunning;

  async function submitResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setResearchState({
      status: "running",
    });

    try {
      const response = await fetch("/v2/api/ai/company-research", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          ticker: ticker.trim().toUpperCase() || undefined,
          researchQuestion: researchQuestion.trim() || undefined,
          evidence: cleanEvidence(evidence),
        }),
      });

      const payload = (await response.json()) as
        CompanyResearchResponse | ResearchErrorResponse;

      if (!response.ok) {
        const errorPayload = payload as ResearchErrorResponse;

        throw new Error(
          errorPayload.message ??
            "The company research review could not be completed.",
        );
      }

      setResearchState({
        status: "completed",
        result: payload as CompanyResearchResponse,
      });
    } catch (error) {
      setResearchState({
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "The company research review failed.",
      });
    }
  }

  function resetWorkspace() {
    setCompanyName("");
    setTicker("");
    setResearchQuestion("");
    setEvidence([createEvidenceDraft()]);
    setResearchState({
      status: "idle",
    });
  }

  return (
    <div className="investo-research-workspace space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">
            Company Research
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Evaluate a business before considering capital.
          </h1>

          <p className="mt-4 text-base leading-7 text-white/60">
            Provide verified evidence. Investo will prepare a primary financial
            review, an independent risk challenge, and a final committee
            conclusion for your approval.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            "Verified evidence only",
            "Independent model challenge",
            "Human decision required",
          ].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55"
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={submitResearch} className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Research Subject
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Identify the business and the decision question that requires
              review.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_180px]">
            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">
                Company name *
              </span>

              <input
                required
                disabled={isRunning}
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Microsoft Corporation"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">Ticker</span>

              <input
                disabled={isRunning}
                value={ticker}
                onChange={(event) =>
                  setTicker(event.target.value.toUpperCase().slice(0, 20))
                }
                placeholder="MSFT"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm uppercase text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-white/55">
                Decision question
              </span>

              <textarea
                disabled={isRunning}
                rows={4}
                value={researchQuestion}
                onChange={(event) => setResearchQuestion(event.target.value)}
                placeholder="Does the current evidence support further valuation work or an initial position?"
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Evidence Packet
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Add filings, earnings material, financial facts, operating
              metrics, or other verified evidence. Investo will not fill missing
              facts through assumptions.
            </p>
          </div>

          <div className="mt-6">
            <EvidenceEditor
              evidence={evidence}
              onChange={setEvidence}
              disabled={isRunning}
            />
          </div>
        </section>

        {researchState.status === "failed" ? (
          <section className="rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-5">
            <p className="text-sm font-medium text-red-100">
              Research could not be completed
            </p>
            <p className="mt-2 text-sm leading-6 text-red-100/70">
              {researchState.message}
            </p>
          </section>
        ) : null}

        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              No transaction authority
            </p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              Research may propose an action, but only you can approve a
              portfolio decision.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {researchState.status === "completed" ? (
              <button
                type="button"
                onClick={resetWorkspace}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm text-white/65 transition hover:border-white/30 hover:text-white"
              >
                Start new review
              </button>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {isRunning ? "Running committee review..." : "Run company review"}
            </button>
          </div>
        </section>
      </form>

      {researchState.status === "running" ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="h-3 w-3 animate-pulse rounded-full bg-amber-200"
            />

            <div>
              <p className="text-sm font-medium text-white">
                Investment committee review in progress
              </p>

              <p className="mt-1 text-sm text-white/45">
                Primary analysis, independent challenge, and committee
                reconciliation are running.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {researchState.status === "completed" ? (
        <ResearchResults result={researchState.result} />
      ) : null}
    </div>
  );
}
