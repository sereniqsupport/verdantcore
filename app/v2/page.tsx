import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { initializeInvestoWorkspace } from "@/app/v2/bootstrap-actions";
import { requireInvestoUser } from "@/lib/investo/auth";
import { bootstrapInvestoWorkspace } from "@/lib/investo/bootstrap";
import { loadInvestoDashboard } from "@/lib/investo/dashboard";
import { InvestoOperationsControl } from "@/components/investo/operations/InvestoOperationsControl";

export const metadata: Metadata = {
  title: "Command Center",
};

type CommandCenterPageProps = {
  searchParams: Promise<{
    setup?: string;
    setup_error?: string;
  }>;
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function InvestoCommandCenterPage({
  searchParams,
}: CommandCenterPageProps) {
  const params = await searchParams;
  const { supabase, user } = await requireInvestoUser();

  const bootstrap = await bootstrapInvestoWorkspace(supabase, user);

  const dashboard = bootstrap.error
    ? {
        portfolioId: null,
        portfolioName: "Primary Investment Portfolio",
        portfolioValue: 0,
        availableCapital: 0,
        holdingsCount: 0,
        preparedDecisions: 0,
        openAlerts: 0,
        watchlistCount: 0,
        databaseReady: false,
        databaseError: bootstrap.error,
      }
    : await loadInvestoDashboard(supabase, user.id);

  const setupReady =
    bootstrap.profileReady &&
    bootstrap.portfolioReady &&
    bootstrap.accountsReady &&
    dashboard.databaseReady;

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Executive Command Center</p>
          <h1>Capital allocation with discipline.</h1>
        </div>

        <p>
          Investo prepares research, valuation, portfolio risk, and investment
          decisions while keeping every transaction under your approval.
        </p>
      </section>

      {params.setup === "complete" ? (
        <div className="investo-system-message investo-system-message-success">
          Your private Investo workspace is ready.
        </div>
      ) : null}

      {params.setup_error ? (
        <div className="investo-system-message investo-system-message-error">
          Workspace setup could not be completed: {params.setup_error}
        </div>
      ) : null}

      {!setupReady ? (
        <section className="investo-setup-panel">
          <div>
            <p className="investo-eyebrow">Database Connection Required</p>
            <h2>Complete your private investment workspace.</h2>

            <p>
              Apply the Investo migration in Supabase, then initialize your
              private profile, primary portfolio, and investment accounts.
            </p>

            {dashboard.databaseError ? (
              <code>{dashboard.databaseError}</code>
            ) : null}
          </div>

          <form action={initializeInvestoWorkspace}>
            <button type="submit">Initialize Investo</button>
          </form>
        </section>
      ) : null}

      <InvestoOperationsControl supabase={supabase} userId={user.id} />

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
          <span className="investo-card-detail">Cash and Treasury reserve</span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Prepared Decisions</span>
          <strong className="investo-card-value">
            {dashboard.preparedDecisions}
          </strong>
          <span className="investo-card-detail">Human approval required</span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Open Alerts</span>
          <strong className="investo-card-value">{dashboard.openAlerts}</strong>
          <span className="investo-card-detail">
            Material portfolio changes
          </span>
        </article>
      </section>

      <section className="investo-work-grid">
        <article className="investo-card">
          <p className="investo-eyebrow">Portfolio Foundation</p>
          <h2>{dashboard.portfolioName}</h2>

          <div className="investo-prepared-list">
            <div className="investo-prepared-row">
              <span>HOLDINGS</span>

              <div>
                <strong>{dashboard.holdingsCount} positions</strong>
                <small>Securities currently recorded in Investo</small>
              </div>

              <span className="investo-pill">
                {dashboard.holdingsCount > 0 ? "Active" : "Awaiting import"}
              </span>
            </div>

            <div className="investo-prepared-row">
              <span>WATCHLIST</span>

              <div>
                <strong>{dashboard.watchlistCount} opportunities</strong>
                <small>Businesses under research and valuation</small>
              </div>

              <span className="investo-pill">Private</span>
            </div>

            <div className="investo-prepared-row">
              <span>DATABASE</span>

              <div>
                <strong>
                  {dashboard.databaseReady ? "Connected" : "Action required"}
                </strong>
                <small>Supabase investment records and security controls</small>
              </div>

              <span className="investo-pill">
                {dashboard.databaseReady ? "Healthy" : "Unavailable"}
              </span>
            </div>
          </div>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Investment Policy</p>
          <h2>Research continuously. Trade deliberately.</h2>

          <p>
            Investo may identify opportunities, challenge investment theses,
            calculate intrinsic value, and prepare recommendations. It cannot
            approve or execute a transaction on your behalf.
          </p>
        </article>
      </section>
    </InvestoProtectedPage>
  );
}
