import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { initializeInvestoWorkspace } from "@/app/v2/bootstrap-actions";
import { requireInvestoUser } from "@/lib/investo/auth";
import { bootstrapInvestoWorkspace } from "@/lib/investo/bootstrap";
import { loadInvestoDashboard } from "@/lib/investo/dashboard";
import { ExecutiveInvestmentWorkspace } from "@/components/investo/dashboard/ExecutiveInvestmentWorkspace";
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

      <ExecutiveInvestmentWorkspace dashboard={dashboard} />
    </InvestoProtectedPage>
  );
}
