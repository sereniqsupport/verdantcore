import { notFound } from "next/navigation";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { ResearchActionPanel } from "@/components/investo/research/ResearchActionPanel";
import { requireInvestoUser } from "@/lib/investo/auth";
import { getResearchReport } from "@/lib/investo/research/repository";

export default async function SavedResearchPage({
  params,
}: {
  params: Promise<{
    reportId: string;
  }>;
}) {
  const { reportId } = await params;

  const { supabase, user } = await requireInvestoUser();

  const report = await getResearchReport({
    supabase,
    userId: user.id,
    reportId,
  });

  if (!report) {
    notFound();
  }

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Saved Research</p>

          <h1>{report.symbol}</h1>
        </div>

        <p>Permanent investment committee record preserved for human review.</p>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Executive Summary</p>

          <h2>{report.title}</h2>

          <p>{report.executive_summary ?? "No executive summary recorded."}</p>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Committee Record</p>

          <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-white/65">
            {report.management_analysis ?? "No committee record was saved."}
          </pre>
        </article>

        <ResearchActionPanel reportId={report.id} />
      </section>
    </InvestoProtectedPage>
  );
}
