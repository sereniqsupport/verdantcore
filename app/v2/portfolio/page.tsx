import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";
import { requireInvestoUser } from "@/lib/investo/auth";

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

  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Private Portfolio</p>
          <h1>{portfolio.data?.name ?? "Portfolio"}</h1>
        </div>

        <p>
          Your holdings, allocation, account structure, cost basis, and
          position-level investment conviction.
        </p>
      </section>

      <section className="investo-metric-grid">
        <article className="investo-card">
          <span className="investo-card-label">Portfolio Value</span>
          <strong className="investo-card-value">
            {currency(portfolioValue)}
          </strong>
          <span className="investo-card-detail">
            Across all private accounts
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Holdings</span>
          <strong className="investo-card-value">
            {holdings.length}
          </strong>
          <span className="investo-card-detail">
            Active investment positions
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Accounts</span>
          <strong className="investo-card-value">
            {accounts.length}
          </strong>
          <span className="investo-card-detail">
            IRA and taxable brokerage
          </span>
        </article>

        <article className="investo-card">
          <span className="investo-card-label">Benchmark</span>
          <strong className="investo-card-value">
            {portfolio.data?.benchmark_symbol ?? "SPY"}
          </strong>
          <span className="investo-card-detail">
            Long-term performance comparison
          </span>
        </article>
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
              No holdings have been imported yet. Portfolio entry and secure
              CSV import will be added in the next phase.
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
                    <th>Conviction</th>
                  </tr>
                </thead>

                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.id}>
                      <td>
                        <strong>{holding.symbol}</strong>
                      </td>
                      <td>{holding.asset_name ?? "—"}</td>
                      <td>{Number(holding.quantity).toLocaleString()}</td>
                      <td>{currency(Number(holding.average_cost ?? 0))}</td>
                      <td>{currency(Number(holding.current_price ?? 0))}</td>
                      <td>{currency(Number(holding.market_value ?? 0))}</td>
                      <td>{holding.conviction ?? "Not rated"}</td>
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
