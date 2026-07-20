import Link from "next/link";
import type { InvestoResearchReport } from "@/lib/investo/database/types";

type ResearchMetadata = {
  companyName?: string;
  conclusion?: string;
  proposedAction?: string;
};

function readMetadata(value: string | null): ResearchMetadata {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as ResearchMetadata;
  } catch {
    return {};
  }
}

function humanize(value: string | undefined) {
  return value ? value.replaceAll("_", " ") : "Not stated";
}

export function ResearchHistory({
  reports,
}: {
  reports: InvestoResearchReport[];
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
            Research History
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Completed company reviews
          </h2>
        </div>

        <span className="text-sm text-white/35">{reports.length} saved</span>
      </div>

      {reports.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/45">
          Completed research reports will appear here.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((report) => {
            const metadata = readMetadata(report.management_analysis);

            return (
              <article
                key={report.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-white/35">
                      {report.symbol}
                    </p>

                    <h3 className="mt-1 font-semibold text-white">
                      {metadata.companyName ?? report.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                      {humanize(metadata.conclusion)}
                    </span>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-white/55">
                      {humanize(metadata.proposedAction)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55">
                  {report.executive_summary ?? "No executive summary recorded."}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/35">
                  <span>{new Date(report.created_at).toLocaleString()}</span>

                  <Link
                    href={`/v2/research/${report.id}`}
                    className="text-white/60 hover:text-white"
                  >
                    Open report →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
