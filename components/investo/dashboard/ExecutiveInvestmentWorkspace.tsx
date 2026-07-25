import Link from "next/link";
import type { InvestoDashboardData } from "@/lib/investo/dashboard";

type ExecutiveInvestmentWorkspaceProps = {
  dashboard: InvestoDashboardData;
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const workspaceLinks = [
  {
    href: "/v2/strategies",
    label: "Investment Direction",
    description:
      "Separate protective, enterprising, and swing capital decisions.",
  },
  {
    href: "/v2/portfolio",
    label: "Portfolio",
    description: "Review holdings, account structure, allocation, and conviction.",
  },
  {
    href: "/v2/opportunities",
    label: "Opportunities",
    description: "Review companies retained for research and future allocation.",
  },
  {
    href: "/v2/research",
    label: "Research",
    description: "Open company analysis, valuation work, and investment evidence.",
  },
  {
    href: "/v2/risk",
    label: "Capital Protection",
    description: "Review concentration, downside exposure, and portfolio safeguards.",
  },
  {
    href: "/v2/decisions",
    label: "Decision Queue",
    description: "Review prepared actions that require your approval.",
  },
];

export function ExecutiveInvestmentWorkspace({
  dashboard,
}: ExecutiveInvestmentWorkspaceProps) {
  return (
    <>
      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Portfolio Value</span>
          <strong className="investo-card-value">
            {currency(dashboard.portfolioValue)}
          </strong>
          <span className="investo-card-detail">
            {dashboard.holdingsCount} active holdings
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Available Capital</span>
          <strong className="investo-card-value">
            {currency(dashboard.availableCapital)}
          </strong>
          <span className="investo-card-detail">
            Cash and Treasury reserve
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Decisions Awaiting Review</span>
          <strong className="investo-card-value">
            {dashboard.preparedDecisions}
          </strong>
          <span className="investo-card-detail">
            Your approval remains required
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Portfolio Alerts</span>
          <strong className="investo-card-value">
            {dashboard.openAlerts}
          </strong>
          <span className="investo-card-detail">
            Material changes requiring attention
          </span>
        </article>
      </section>

      <section className="investo-work-grid">
        <article className="investo-card">
          <p className="investo-eyebrow">Investment Committee</p>
          <h2>What requires your judgment now</h2>

          <div className="investo-prepared-list">
            <div className="investo-prepared-row">
              <span>DECISIONS</span>
              <div>
                <strong>
                  {dashboard.preparedDecisions} awaiting review
                </strong>
                <small>
                  Prepared actions remain blocked until you approve them
                </small>
              </div>
              <span className="investo-pill">
                {dashboard.preparedDecisions > 0 ? "Review" : "Clear"}
              </span>
            </div>

            <div className="investo-prepared-row">
              <span>OPPORTUNITIES</span>
              <div>
                <strong>
                  {dashboard.watchlistCount} under consideration
                </strong>
                <small>
                  Companies retained for research and valuation
                </small>
              </div>
              <span className="investo-pill">Watchlist</span>
            </div>

            <div className="investo-prepared-row">
              <span>ALERTS</span>
              <div>
                <strong>{dashboard.openAlerts} open alerts</strong>
                <small>
                  Material portfolio changes and protection concerns
                </small>
              </div>
              <span className="investo-pill">
                {dashboard.openAlerts > 0 ? "Attention" : "Stable"}
              </span>
            </div>
          </div>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Portfolio Position</p>
          <h2>{dashboard.portfolioName}</h2>

          <div className="investo-prepared-list">
            <div className="investo-prepared-row">
              <span>HOLDINGS</span>
              <div>
                <strong>{dashboard.holdingsCount} positions</strong>
                <small>Recorded securities in the primary portfolio</small>
              </div>
              <span className="investo-pill">
                {dashboard.holdingsCount > 0 ? "Active" : "Awaiting import"}
              </span>
            </div>

            <div className="investo-prepared-row">
              <span>CAPITAL</span>
              <div>
                <strong>{currency(dashboard.availableCapital)}</strong>
                <small>Available for disciplined future allocation</small>
              </div>
              <span className="investo-pill">Reserved</span>
            </div>

            <div className="investo-prepared-row">
              <span>SYSTEM</span>
              <div>
                <strong>
                  {dashboard.databaseReady ? "Connected" : "Action required"}
                </strong>
                <small>Private investment records and controls</small>
              </div>
              <span className="investo-pill">
                {dashboard.databaseReady ? "Healthy" : "Unavailable"}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Private Investment Office</p>
          <h2>Move from signal to informed judgment</h2>

          <div className="investo-prepared-list">
            {workspaceLinks.map((item) => (
              <div className="investo-prepared-row" key={item.href}>
                <span>OPEN</span>
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
                <Link className="investo-pill" href={item.href}>
                  Review
                </Link>
              </div>
            ))}
          </div>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Investment Policy</p>
          <h2>Research continuously. Allocate deliberately.</h2>
          <p>
            Investo may identify opportunities, challenge investment theses,
            estimate intrinsic value, and prepare recommendations. It cannot
            approve or execute a transaction on your behalf.
          </p>
        </article>
      </section>
    </>
  );
}
