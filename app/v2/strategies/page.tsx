import Link from "next/link";
import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { requireInvestoUser } from "@/lib/investo/auth";
import {
  loadStrategyDirectionOverview,
  type InvestoStrategyCode,
  type StrategyDirectionRow,
} from "@/lib/investo/strategy/repository";

export const metadata: Metadata = {
  title: "Investment Direction",
};

const strategyGuidance: Record<
  InvestoStrategyCode,
  {
    horizon: string;
    purpose: string;
    decisions: string;
  }
> = {
  protective: {
    horizon: "Long term",
    purpose:
      "Protect capital, build dependable income, and compound wealth with measured risk.",
    decisions: "Hold, Add, Reduce, Rebalance, or Exit",
  },
  enterprising: {
    horizon: "Long term",
    purpose:
      "Pursue deeply researched opportunities that offer an acceptable margin of safety.",
    decisions: "Research, Prepare, Buy, Add, Hold, Reduce, or Exit",
  },
  swing: {
    horizon: "Weeks to months",
    purpose:
      "Capture controlled medium-term opportunities without disturbing long-term capital.",
    decisions: "Prepare, Enter, Hold, Reduce, Exit, or Decline",
  },
  reserve: {
    horizon: "Available capital",
    purpose:
      "Preserve liquidity for protection, planned purchases, and future opportunities.",
    decisions: "Hold, Rebalance, Deploy, or Replenish",
  },
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function percentage(value: number) {
  return `${value.toFixed(1)}%`;
}

function StrategyCard({
  strategy,
}: {
  strategy: StrategyDirectionRow;
}) {
  const guidance = strategyGuidance[strategy.sleeve.code];
  const target = Number(
    strategy.policy?.target_allocation_percent ?? 0,
  );
  const maximum = Number(
    strategy.policy?.maximum_allocation_percent ?? 0,
  );

  const allocationStatus =
    strategy.portfolioAllocationPercent > maximum && maximum > 0
      ? "Above policy"
      : strategy.portfolioAllocationPercent < target
        ? "Below target"
        : "Within range";

  return (
    <article className="investo-card">
      <div className="investo-section-heading-row">
        <div>
          <span className="investo-card-label">
            {guidance.horizon}
          </span>
          <h2>{strategy.sleeve.name}</h2>
        </div>

        <span className="investo-pill">{allocationStatus}</span>
      </div>

      <p>{strategy.sleeve.description ?? guidance.purpose}</p>

      <div className="investo-prepared-list">
        <div className="investo-prepared-row">
          <span>CAPITAL</span>
          <div>
            <strong>
              {currency(strategy.assignedMarketValue)}
            </strong>
            <small>
              {percentage(strategy.portfolioAllocationPercent)} of
              the recorded portfolio
            </small>
          </div>
        </div>

        <div className="investo-prepared-row">
          <span>POLICY</span>
          <div>
            <strong>
              Target {percentage(target)} · Maximum{" "}
              {percentage(maximum)}
            </strong>
            <small>
              Review{" "}
              {strategy.policy?.review_cadence ?? "Not configured"} ·{" "}
              {strategy.policy?.expected_holding_period ??
                guidance.horizon}
            </small>
          </div>
        </div>

        <div className="investo-prepared-row">
          <span>POSITIONS</span>
          <div>
            <strong>
              {strategy.assignedHoldingCount} assigned holdings
            </strong>
            <small>
              Standard position{" "}
              {percentage(
                Number(
                  strategy.positionControl
                    ?.standard_position_percent ?? 0,
                ),
              )}{" "}
              · Maximum{" "}
              {percentage(
                Number(
                  strategy.positionControl
                    ?.maximum_position_percent ??
                    strategy.policy?.maximum_position_percent ??
                    0,
                ),
              )}
            </small>
          </div>
        </div>

        <div className="investo-prepared-row">
          <span>REVIEW</span>
          <div>
            <strong>
              {strategy.activeConditionCount} prepared conditions ·{" "}
              {strategy.activeSignalCount} active signals
            </strong>
            <small>{guidance.decisions}</small>
          </div>

          <span className="investo-pill">Human approved</span>
        </div>
      </div>
    </article>
  );
}

export default async function InvestmentDirectionPage() {
  const { supabase, user } = await requireInvestoUser();
  const overview = await loadStrategyDirectionOverview(
    supabase,
    user.id,
  );

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Portfolio Direction</p>
          <h1>Give every portion of capital a clear purpose.</h1>
        </div>

        <p>
          Separate capital protection, long-term opportunity,
          controlled swing trades, and reserve cash without replacing
          the holdings already recorded in Investo.
        </p>
      </section>

      {!overview.databaseReady ? (
        <section className="investo-card">
          <p className="investo-eyebrow">Database Update Required</p>
          <h2>Apply the Phase 3 strategy migrations.</h2>
          <p>
            The Investment Direction page is ready, but the new
            strategy tables have not yet been applied to Supabase.
            Existing portfolio records remain available and unchanged.
          </p>
        </section>
      ) : overview.portfolioId === null ? (
        <section className="investo-card">
          <p className="investo-eyebrow">Portfolio Setup</p>
          <h2>Initialize your primary portfolio first.</h2>
          <p>
            Strategy direction will become available after Investo
            creates your primary portfolio and investment accounts.
          </p>

          <Link className="investo-pill" href="/v2">
            Open Command Center
          </Link>
        </section>
      ) : (
        <>
          <section className="investo-metric-grid">
            <article className="investo-card">
              <span className="investo-card-label">
                Portfolio
              </span>
              <h2>{overview.portfolioName}</h2>
              <p>
                {currency(overview.totalPortfolioValue)} in recorded
                holdings.
              </p>
            </article>

            <article className="investo-card">
              <span className="investo-card-label">
                Strategy Coverage
              </span>
              <h2>{overview.strategies.length} capital sleeves</h2>
              <p>
                Protective, enterprising, swing, and reserve capital
                remain separately governed.
              </p>
            </article>

            <article className="investo-card">
              <span className="investo-card-label">
                Classification
              </span>
              <h2>
                {overview.unassignedHoldingCount} unassigned holdings
              </h2>
              <p>
                Holdings remain unchanged until a strategy
                classification is explicitly approved.
              </p>
            </article>

            <article className="investo-card">
              <span className="investo-card-label">
                Decision Control
              </span>
              <h2>Human approval required</h2>
              <p>
                Signals and prepared conditions cannot execute a trade
                or change an allocation.
              </p>
            </article>
          </section>

          <section className="investo-metric-grid">
            {overview.strategies.map((strategy) => (
              <StrategyCard
                key={strategy.sleeve.id}
                strategy={strategy}
              />
            ))}
          </section>

          <section className="investo-work-grid">
            <article className="investo-card">
              <p className="investo-eyebrow">
                Portfolio Separation
              </p>
              <h2>
                Long-term investments and swing trades remain
                distinct.
              </h2>
              <p>
                Strategy assignments classify existing holdings
                without replacing holdings, accounts, transactions,
                research, or approval records.
              </p>
            </article>

            <article className="investo-card">
              <p className="investo-eyebrow">Decision Control</p>
              <h2>
                Investo prepares direction. You authorize action.
              </h2>
              <p>
                Market signals, position limits, and prepared
                conditions support judgment. They do not authorize
                purchases, sales, or allocation changes.
              </p>
            </article>
          </section>

          <section className="investo-section-stack">
            <article className="investo-card">
              <p className="investo-eyebrow">
                Portfolio Review
              </p>
              <h2>Review the holdings already recorded.</h2>
              <p>
                Existing holdings remain the source of record.
                Strategy classification is an additional management
                layer.
              </p>

              <Link className="investo-pill" href="/v2/portfolio">
                Review Portfolio
              </Link>
            </article>
          </section>
        </>
      )}
    </InvestoProtectedPage>
  );
}
