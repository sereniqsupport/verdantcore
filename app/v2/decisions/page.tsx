import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { requireInvestoUser } from "@/lib/investo/auth";
import { getDecisionQueue } from "@/lib/investo/research/repository";
import type { InvestoDecision } from "@/lib/investo/database/types";

export const metadata: Metadata = {
  title: "Decision Queue",
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function DecisionsPage() {
  const { supabase, user } = await requireInvestoUser();

  let decisions: InvestoDecision[] = [];

  try {
    decisions = await getDecisionQueue({
      supabase,
      userId: user.id,
    });
  } catch (error) {
    console.error("Unable to load Investo decisions:", error);
  }

  const prepared = decisions.filter(
    (decision) => decision.status === "prepared",
  );

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Human Approval</p>

          <h1>Decision Queue</h1>
        </div>

        <p>
          Prepared investment decisions awaiting your judgment. No transaction
          is executed here.
        </p>
      </section>

      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Awaiting Review</span>

          <strong className="investo-card-value">{prepared.length}</strong>

          <span className="investo-card-detail">Prepared decisions</span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Recorded Decisions</span>

          <strong className="investo-card-value">{decisions.length}</strong>

          <span className="investo-card-detail">Complete history</span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Transactions Executed</span>

          <strong className="investo-card-value">0</strong>

          <span className="investo-card-detail">Human-controlled boundary</span>
        </article>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Prepared Decisions</p>

          <h2>Items requiring judgment</h2>

          {decisions.length === 0 ? (
            <div className="investo-empty-state">
              No investment decisions have been prepared.
            </div>
          ) : (
            <div className="investo-table-wrap">
              <table className="investo-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Prepared Action</th>
                    <th>Status</th>
                    <th>Decision Note</th>
                    <th>Recorded</th>
                    <th>Execution</th>
                  </tr>
                </thead>

                <tbody>
                  {decisions.map((decision) => (
                    <tr key={decision.id}>
                      <td>
                        <strong>{decision.symbol}</strong>
                      </td>

                      <td>{humanize(decision.action)}</td>

                      <td>{humanize(decision.status)}</td>

                      <td>
                        {decision.decision_note ?? "Human review required"}
                      </td>

                      <td>
                        {new Date(decision.created_at).toLocaleDateString()}
                      </td>

                      <td>
                        {decision.executed_at
                          ? "Recorded as executed"
                          : "Not executed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </InvestoProtectedPage>
  );
}
