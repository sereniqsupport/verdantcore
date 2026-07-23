import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { requireInvestoUser } from "@/lib/investo/auth";
import {
  addPortfolioHolding,
  removePortfolioHolding,
  updatePortfolioHolding,
} from "@/app/v2/portfolio/actions";

export const metadata: Metadata = {
  title: "Portfolio",
};

function currency(value: number | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function percentage(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function PortfolioPage() {
  const { supabase, user } = await requireInvestoUser();

  const portfolio = await supabase
    .from("investo_portfolios")
    .select("id, name, benchmark_symbol, target_cash_weight")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const portfolioId = portfolio.data?.id ?? null;

  const [accountsResult, holdingsResult] = portfolioId
    ? await Promise.all([
        supabase
          .from("investo_accounts")
          .select("id, name, institution_name, account_type")
          .eq("user_id", user.id)
          .eq("portfolio_id", portfolioId)
          .order("name"),

        supabase
          .from("investo_holdings")
          .select(
            "id, symbol, asset_name, asset_class, quantity, average_cost, current_price, market_value, portfolio_weight, conviction",
          )
          .eq("user_id", user.id)
          .eq("portfolio_id", portfolioId)
          .order("market_value", {
            ascending: false,
            nullsFirst: false,
          }),
      ])
    : [
        {
          data: [],
          error: null,
        },
        {
          data: [],
          error: null,
        },
      ];

  const accounts = accountsResult.data ?? [];
  const holdings = holdingsResult.data ?? [];

  const portfolioValue = holdings.reduce(
    (total, holding) => total + Number(holding.market_value ?? 0),
    0,
  );

  const totalCostBasis = holdings.reduce((total, holding) => {
    const quantity = Number(holding.quantity ?? 0);
    const averageCost = Number(holding.average_cost ?? 0);

    return total + quantity * averageCost;
  }, 0);

  const unrealizedGain = portfolioValue - totalCostBasis;

  const largestHolding = holdings[0] ?? null;

  const largestPositionWeight =
    portfolioValue > 0 && largestHolding
      ? Number(largestHolding.market_value ?? 0) / portfolioValue
      : 0;

  const gainClass =
    unrealizedGain > 0
      ? "investo-value-positive"
      : unrealizedGain < 0
        ? "investo-value-negative"
        : "";

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Private Portfolio</p>
          <h1>{portfolio.data?.name ?? "Portfolio"}</h1>
        </div>

        <p>
          A clear view of current holdings, account structure, cost basis, and
          portfolio concentration.
        </p>
      </section>

      <section className="investo-metric-grid investo-portfolio-metrics">
        <article className="investo-card">
          <span className="investo-card-label">Portfolio Value</span>
          <strong className="investo-card-value">
            {currency(portfolioValue)}
          </strong>
          <span className="investo-card-detail">
            Current recorded market value
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Cost Basis</span>
          <strong className="investo-card-value">
            {currency(totalCostBasis)}
          </strong>
          <span className="investo-card-detail">
            Recorded acquisition value
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Unrealized Gain/Loss</span>
          <strong className={`investo-card-value ${gainClass}`}>
            {currency(unrealizedGain)}
          </strong>
          <span className="investo-card-detail">
            Market value less cost basis
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Largest Position</span>
          <strong className="investo-card-value">
            {largestHolding?.symbol ?? "—"}
          </strong>
          <span className="investo-card-detail">
            {largestHolding
              ? `${percentage(largestPositionWeight)} of portfolio`
              : "No position concentration yet"}
          </span>
        </article>
      </section>

      <section className="investo-portfolio-summary">
        <article className="investo-card">
          <span className="investo-card-label">Holdings</span>
          <strong className="investo-card-value">{holdings.length}</strong>
          <span className="investo-card-detail">
            Active investment positions
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Accounts</span>
          <strong className="investo-card-value">{accounts.length}</strong>
          <span className="investo-card-detail">
            Connected private accounts
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Benchmark</span>
          <strong className="investo-card-value">
            {portfolio.data?.benchmark_symbol ?? "SPY"}
          </strong>
          <span className="investo-card-detail">
            Performance comparison
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Target Cash</span>
          <strong className="investo-card-value">
            {percentage(Number(portfolio.data?.target_cash_weight ?? 0))}
          </strong>
          <span className="investo-card-detail">
            Portfolio cash target
          </span>
        </article>
      </section>

      <section className="investo-card investo-holding-entry-panel">
        <div className="investo-section-heading-row">
          <div>
            <p className="investo-eyebrow">Portfolio Entry</p>
            <h2>Add an investment position</h2>
          </div>

          <span className="investo-pill">Manual entry</span>
        </div>

        {accounts.length === 0 ? (
          <div className="investo-empty-state">
            Create or initialize an investment account before adding holdings.
          </div>
        ) : (
          <form action={addPortfolioHolding} className="investo-holding-form">
            <label>
              <span>Account</span>
              <select defaultValue="" name="account_id" required>
                <option disabled value="">
                  Select account
                </option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Symbol</span>
              <input
                autoCapitalize="characters"
                maxLength={15}
                name="symbol"
                placeholder="MSFT"
                required
              />
            </label>

            <label className="investo-holding-form-wide">
              <span>Company or asset name</span>
              <input
                name="asset_name"
                placeholder="Microsoft Corporation"
              />
            </label>

            <label>
              <span>Asset class</span>
              <select defaultValue="equity" name="asset_class">
                <option value="equity">Equity</option>
                <option value="etf">ETF</option>
                <option value="fund">Fund</option>
                <option value="bond">Bond</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              <span>Quantity</span>
              <input
                min="0.000001"
                name="quantity"
                placeholder="10"
                required
                step="any"
                type="number"
              />
            </label>

            <label>
              <span>Average cost</span>
              <input
                min="0.01"
                name="average_cost"
                placeholder="350.00"
                required
                step="0.01"
                type="number"
              />
            </label>

            <label>
              <span>Current price</span>
              <input
                min="0.01"
                name="current_price"
                placeholder="425.00"
                required
                step="0.01"
                type="number"
              />
            </label>

            <label>
              <span>Conviction</span>
              <select defaultValue="Not rated" name="conviction">
                <option value="Not rated">Not rated</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Core">Core</option>
              </select>
            </label>

            <button className="investo-holding-submit" type="submit">
              Add position
            </button>
          </form>
        )}
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Investment Accounts</p>
          <h2>Account structure</h2>

          <div className="investo-prepared-list">
            {accounts.length === 0 ? (
              <div className="investo-empty-state">
                Your private investment accounts have not been initialized.
              </div>
            ) : (
              accounts.map((account) => (
                <div className="investo-prepared-row" key={account.id}>
                  <span>{account.account_type ?? "ACCOUNT"}</span>

                  <div>
                    <strong>{account.name}</strong>
                    <small>
                      {account.institution_name ?? "Private institution"}
                    </small>
                  </div>

                  <span className="investo-pill">Active</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Current Holdings</p>
          <h2>Position register</h2>

          {holdings.length === 0 ? (
            <div className="investo-empty-state">
              No holdings have been recorded yet.
            </div>
          ) : (
            <div className="investo-table-wrap">
              <table className="investo-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Quantity</th>
                    <th>Average Cost</th>
                    <th>Current Price</th>
                    <th>Market Value</th>
                    <th>Gain/Loss</th>
                    <th>Weight</th>
                    <th>Conviction</th>
                    <th>Manage</th>
                  </tr>
                </thead>

                <tbody>
                  {holdings.map((holding) => {
                    const quantity = Number(holding.quantity ?? 0);
                    const averageCost = Number(holding.average_cost ?? 0);
                    const marketValue = Number(holding.market_value ?? 0);
                    const positionCost = quantity * averageCost;
                    const positionGain = marketValue - positionCost;
                    const positionWeight =
                      portfolioValue > 0 ? marketValue / portfolioValue : 0;

                    return (
                      <tr key={holding.id}>
                        <td>
                          <strong>{holding.symbol}</strong>
                        </td>
                        <td>{holding.asset_name ?? "—"}</td>
                        <td>{quantity.toLocaleString()}</td>
                        <td>{currency(averageCost)}</td>
                        <td>
                          {currency(Number(holding.current_price ?? 0))}
                        </td>
                        <td>{currency(marketValue)}</td>
                        <td
                          className={
                            positionGain > 0
                              ? "investo-value-positive"
                              : positionGain < 0
                                ? "investo-value-negative"
                                : undefined
                          }
                        >
                          {currency(positionGain)}
                        </td>
                        <td>{percentage(positionWeight)}</td>
                        <td>{holding.conviction ?? "Not rated"}</td>
                        <td>
                          <details className="investo-holding-manage">
                            <summary>Manage</summary>

                            <form
                              action={updatePortfolioHolding}
                              className="investo-holding-edit-form"
                            >
                              <input
                                name="holding_id"
                                type="hidden"
                                value={holding.id}
                              />

                              <label>
                                <span>Quantity</span>
                                <input
                                  defaultValue={quantity}
                                  min="0.000001"
                                  name="quantity"
                                  required
                                  step="any"
                                  type="number"
                                />
                              </label>

                              <label>
                                <span>Average cost</span>
                                <input
                                  defaultValue={averageCost}
                                  min="0.01"
                                  name="average_cost"
                                  required
                                  step="0.01"
                                  type="number"
                                />
                              </label>

                              <label>
                                <span>Current price</span>
                                <input
                                  defaultValue={Number(
                                    holding.current_price ?? 0,
                                  )}
                                  min="0.01"
                                  name="current_price"
                                  required
                                  step="0.01"
                                  type="number"
                                />
                              </label>

                              <label>
                                <span>Conviction</span>
                                <select
                                  defaultValue={
                                    holding.conviction ?? "Not rated"
                                  }
                                  name="conviction"
                                >
                                  <option value="Not rated">Not rated</option>
                                  <option value="Low">Low</option>
                                  <option value="Moderate">Moderate</option>
                                  <option value="High">High</option>
                                  <option value="Core">Core</option>
                                </select>
                              </label>

                              <button type="submit">Save changes</button>
                            </form>

                            <form action={removePortfolioHolding}>
                              <input
                                name="holding_id"
                                type="hidden"
                                value={holding.id}
                              />

                              <button
                                className="investo-holding-remove"
                                type="submit"
                              >
                                Remove position
                              </button>
                            </form>
                          </details>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </InvestoProtectedPage>
  );
}
