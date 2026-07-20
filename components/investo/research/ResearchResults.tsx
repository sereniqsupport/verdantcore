"use client";

import { ResearchActionPanel } from "@/components/investo/research/ResearchActionPanel";

import type {
  CommitteeOutput,
  CompanyResearchResponse,
} from "@/components/investo/research/types";
import {
  assessmentTone,
  humanize,
} from "@/components/investo/research/research-format";

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
        assessmentTone(value),
      ].join(" ")}
    >
      {humanize(value)}
    </span>
  );
}

function TextList({
  items,
  emptyLabel = "None identified.",
}: {
  items: string[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-white/45">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-3 text-sm leading-6 text-white/70"
        >
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DetailCard({
  title,
  status,
  children,
}: {
  title: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>

        {status ? <StatusBadge value={status} /> : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function CommitteeDecision({ output }: { output: CommitteeOutput }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Investment Committee
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              {output.companyName}
              {output.ticker ? ` · ${output.ticker}` : ""}
            </h2>

            <p className="mt-2 text-sm text-white/45">
              Analysis date: {output.analysisDate}
              {output.evidenceAsOf
                ? ` · Evidence through ${output.evidenceAsOf}`
                : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge value={output.conclusion} />
            <StatusBadge value={output.modelAgreement.status} />
          </div>
        </div>

        <p className="mt-6 max-w-4xl text-base leading-7 text-white/75">
          {output.executiveSummary}
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailCard
          title="Business Quality"
          status={output.businessQuality.assessment}
        >
          <p className="text-sm leading-6 text-white/70">
            {output.businessQuality.rationale}
          </p>
        </DetailCard>

        <DetailCard
          title="Capital Allocation"
          status={output.capitalAllocation.assessment}
        >
          <p className="text-sm leading-6 text-white/70">
            {output.capitalAllocation.rationale}
          </p>
        </DetailCard>

        <DetailCard
          title="Competitive Position"
          status={output.competitivePosition.assessment}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Advantages
          </p>
          <TextList items={output.competitivePosition.advantages} />

          <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Vulnerabilities
          </p>
          <TextList items={output.competitivePosition.vulnerabilities} />
        </DetailCard>

        <DetailCard
          title="Financial Strength"
          status={output.financialStrength.assessment}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Strengths
          </p>
          <TextList items={output.financialStrength.strengths} />

          <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Concerns
          </p>
          <TextList items={output.financialStrength.concerns} />
        </DetailCard>

        <DetailCard
          title="Valuation Readiness"
          status={output.valuationReadiness.status}
        >
          <TextList
            items={output.valuationReadiness.missingInputs}
            emptyLabel="The evidence packet contains the core inputs needed for valuation."
          />
        </DetailCard>

        <DetailCard
          title="Model Agreement"
          status={output.modelAgreement.status}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Agreed Points
          </p>
          <TextList items={output.modelAgreement.agreedPoints} />

          <p className="mb-3 mt-6 text-xs font-medium uppercase tracking-[0.15em] text-white/35">
            Disputed Points
          </p>
          <TextList
            items={output.modelAgreement.disputedPoints}
            emptyLabel="No material disagreement was identified."
          />
        </DetailCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DetailCard title="Principal Risks">
          <TextList items={output.principalRisks} />
        </DetailCard>

        <DetailCard title="Thesis Breakers">
          <TextList items={output.thesisBreakers} />
        </DetailCard>

        <DetailCard title="Missing Evidence">
          <TextList
            items={output.missingEvidence}
            emptyLabel="No material evidence gaps were reported."
          />
        </DetailCard>
      </div>

      <section className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.07] p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-100/60">
          Proposed Human Action
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h3 className="text-xl font-semibold text-white">
            {humanize(output.proposedHumanAction.action)}
          </h3>

          <span className="rounded-full border border-amber-300/30 px-3 py-1 text-xs text-amber-100">
            Human approval required
          </span>
        </div>

        <p className="mt-4 max-w-4xl text-sm leading-6 text-white/75">
          {output.proposedHumanAction.rationale}
        </p>

        <div className="mt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
            Conditions Before Action
          </p>

          <TextList
            items={output.proposedHumanAction.conditionsBeforeAction}
            emptyLabel="No immediate portfolio action is authorized."
          />
        </div>

        <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-5 text-white/40">
          Investo prepared this analysis for human review. No transaction was
          approved, placed, or executed.
        </p>
      </section>
    </div>
  );
}

function ModelReview({
  label,
  provider,
  model,
  output,
}: {
  label: string;
  provider: string;
  model: string;
  output: string;
}) {
  return (
    <details className="rounded-2xl border border-white/10 bg-white/[0.025]">
      <summary className="cursor-pointer list-none px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-white">{label}</span>

          <span className="text-xs text-white/40">
            {provider} · {model}
          </span>
        </div>
      </summary>

      <div className="border-t border-white/10 px-5 py-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-white/65">
          {output}
        </p>
      </div>
    </details>
  );
}

export function ResearchResults({
  result,
}: {
  result: CompanyResearchResponse;
}) {
  return (
    <div className="space-y-8">
      <CommitteeDecision output={result.research.committee.output} />

      <section>
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
            Supporting Reviews
          </p>
          <p className="mt-2 text-sm text-white/50">
            Expand either review to inspect how the committee reached its
            conclusion.
          </p>
        </div>

        <div className="space-y-3">
          <ModelReview
            label="Primary Company Analysis"
            provider={result.research.primaryAnalysis.provider}
            model={result.research.primaryAnalysis.model}
            output={result.research.primaryAnalysis.output}
          />

          <ModelReview
            label="Independent Risk Challenge"
            provider={result.research.independentReview.provider}
            model={result.research.independentReview.model}
            output={result.research.independentReview.output}
          />
        </div>
      </section>
      <ResearchActionPanel reportId={result.savedReport.id} />
    </div>
  );
}
