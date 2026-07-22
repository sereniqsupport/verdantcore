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

function statusClass(status: string) {
  if (status === "prepared") {
    return "investo-decision-status investo-decision-status-prepared";
  }

  if (status === "approved" || status === "executed") {
    return "investo-decision-status investo-decision-status-approved";
  }

  if (status === "rejected") {
    return "investo-decision-status investo-decision-status-rejected";
  }

  return "investo-decision-status";
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

  const recorded = decisions.filter(
    (decision) => decision.status !== "prepared",
  );

  const executed = decisions.filter(
    (decision) => Boolean(decision.executed_at),
  );

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Human Approval</p>
          <h1>Decision Queue</h1>
        </div>

        <p>
          Review prepared investment actions and maintain a clear record of
          prior decisions. No transaction is executed automatically.
        </p>
      </section>

      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Awaiting Review</span>
          <strong className="investo-card-value">{prepared.length}</strong>
          <span className="investo-card-detail">
            Prepared decisions requiring judgment
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Recorded Decisions</span>
          <strong className="investo-card-value">{recorded.length}</strong>
          <span className="investo-card-detail">
            Approved, rejected, or completed
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Executed Records</span>
          <strong className="investo-card-value">{executed.length}</strong>
          <span className="investo-card-detail">
            Manually recorded execution history
          </span>
        </article>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <div className="investo-section-heading-row">
            <div>
              <p className="investo-eyebrow">Prepared Decisions</p>
              <h2>Items requiring judgment</h2>
            </div>

            <span className="investo-pill">{prepared.length} open</span>
          </div>

          {prepared.length === 0 ? (
            <div className="investo-empty-state">
              No investment decisions currently require review.
            </div>
          ) : (
            <div className="investo-decision-list">
              {prepared.map((decision) => (
                <article className="investo-decision-card" key={decision.id}>
                  <div className="investo-decision-card-heading">
                    <div>
                      <span className="investo-decision-symbol">
                        {decision.symbol}
                      </span>
                      <strong>{humanize(decision.action)}</strong>
                    </div>

                    <span className={statusClass(decision.status)}>
                      {humanize(decision.status)}
                    </span>
                  </div>

                  <p>
                    {decision.decision_note ??
                      "Human review is required before any action is recorded."}
                  </p>

                  <footer>
                    <span>
                      Prepared{" "}
                      {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                    <span>No automatic execution</span>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="investo-card">
          <div className="investo-section-heading-row">
            <div>
              <p className="investo-eyebrow">Decision History</p>
              <h2>Recorded judgment</h2>
            </div>

            <span className="investo-pill">{recorded.length} recorded</span>
          </div>

          {recorded.length === 0 ? (
            <div className="investo-empty-state">
              No completed investment decisions have been recorded.
            </div>
          ) : (
            <div className="investo-table-wrap">
              <table className="investo-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Decision Note</th>
                    <th>Recorded</th>
                    <th>Execution</th>
                  </tr>
                </thead>

                <tbody>
                  {recorded.map((decision) => (
                    <tr key={decision.id}>
                      <td>
                        <strong>{decision.symbol}</strong>
                      </td>
                      <td>{humanize(decision.action)}</td>
                      <td>
                        <span className={statusClass(decision.status)}>
                          {humanize(decision.status)}
                        </span>
                      </td>
                      <td>
                        {decision.decision_note ?? "No decision note recorded"}
                      </td>
                      <td>
                        {new Date(decision.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {decision.executed_at
                          ? new Date(
                              decision.executed_at,
                            ).toLocaleDateString()
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
