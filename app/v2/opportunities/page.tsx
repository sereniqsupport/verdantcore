import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { requireInvestoUser } from "@/lib/investo/auth";
import { getWatchlist } from "@/lib/investo/research/repository";
import type { InvestoWatchlistItem } from "@/lib/investo/database/types";

export const metadata: Metadata = {
  title: "Watchlist",
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function OpportunitiesPage() {
  const { supabase, user } = await requireInvestoUser();

  let opportunities: InvestoWatchlistItem[] = [];

  try {
    opportunities = await getWatchlist({
      supabase,
      userId: user.id,
    });
  } catch (error) {
    console.error("Unable to load Investo Watchlist:", error);
  }

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Investment Watchlist</p>

          <h1>Opportunities</h1>
        </div>

        <p>Companies retained for continued research and future review.</p>
      </section>

      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Watchlist</span>

          <strong className="investo-card-value">{opportunities.length}</strong>

          <span className="investo-card-detail">Active companies</span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Priority Reviews</span>

          <strong className="investo-card-value">
            {opportunities.filter((item) => item.priority <= 2).length}
          </strong>

          <span className="investo-card-detail">Highest attention</span>
        </article>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Current Watchlist</p>

          <h2>Companies under review</h2>

          {opportunities.length === 0 ? (
            <div className="investo-empty-state">
              No companies have been added to your Watchlist.
            </div>
          ) : (
            <div className="investo-table-wrap">
              <table className="investo-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Priority</th>
                    <th>Reason</th>
                    <th>Next Review</th>
                  </tr>
                </thead>

                <tbody>
                  {opportunities.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.symbol}</strong>

                        <br />

                        <small>
                          {item.company_name ?? "Company name unavailable"}
                        </small>
                      </td>

                      <td>{humanize(item.stage)}</td>

                      <td>{item.priority}</td>

                      <td>{item.discovery_reason ?? "Research review"}</td>

                      <td>
                        {item.next_review_at
                          ? new Date(item.next_review_at).toLocaleDateString()
                          : "Not scheduled"}
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
