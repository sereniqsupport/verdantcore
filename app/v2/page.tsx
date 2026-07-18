import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";

export const metadata: Metadata = {
  title: "Command Center",
};

const preparedWork = [
  {
    action: "RESEARCH",
    title: "Global picks-and-shovels market scan",
    detail: "Find essential suppliers and economic toll roads.",
    status: "Not started",
  },
  {
    action: "VALUE",
    title: "Business valuation pipeline",
    detail: "Calculate value, buy zones, and margin of safety.",
    status: "Not started",
  },
  {
    action: "PROTECT",
    title: "Portfolio resilience review",
    detail: "Measure concentration, liquidity, and permanent-loss risk.",
    status: "Not started",
  },
];

export default function InvestoCommandCenterPage() {
  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Executive Command Center</p>
          <h1>Capital allocation with discipline.</h1>
        </div>

        <p>
          Investo will continuously prepare research, valuation, risk analysis,
          and investment recommendations while keeping every transaction under
          your approval.
        </p>
      </section>

      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Portfolio Value</span>
          <strong className="investo-card-value">Not connected</strong>
          <span className="investo-card-detail">
            Portfolio import comes next
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Available Capital</span>
          <strong className="investo-card-value">Not connected</strong>
          <span className="investo-card-detail">
            Cash and Treasury reserve
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Prepared Decisions</span>
          <strong className="investo-card-value">0</strong>
          <span className="investo-card-detail">
            Human approval required
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Portfolio Risk</span>
          <strong className="investo-card-value">Pending</strong>
          <span className="investo-card-detail">
            Risk baseline not calculated
          </span>
        </article>
      </section>

      <section className="investo-work-grid">
        <article className="investo-card">
          <p className="investo-eyebrow">Prepared Work</p>
          <h2>Investment operating pipeline</h2>

          <div className="investo-prepared-list">
            {preparedWork.map((item) => (
              <div className="investo-prepared-row" key={item.title}>
                <span>{item.action}</span>

                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>

                <span className="investo-pill">{item.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Investment Policy</p>
          <h2>Research continuously. Trade deliberately.</h2>

          <p>
            Investo may identify opportunities, challenge investment theses,
            calculate intrinsic value, and prepare recommendations. It will not
            place autonomous trades.
          </p>
        </article>
      </section>
    </InvestoProtectedPage>
  );
}
