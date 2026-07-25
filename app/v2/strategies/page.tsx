import Link from "next/link";
import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";

export const metadata: Metadata = {
  title: "Investment Direction",
};

const investmentDirections = [
  {
    name: "Protective Investing",
    horizon: "Long term",
    purpose: "Protect capital, build dependable income, and compound wealth with measured risk.",
    appropriateFor:
      "Core portfolio capital that should remain durable across changing market conditions.",
    assetFocus: [
      "U.S. Treasury securities and high-quality bonds",
      "Durable, financially strong companies",
      "Diversified funds and selected income securities",
      "Cash reserves for protection and future opportunities",
    ],
    direction: [
      "Favor financial strength and dependable cash flow",
      "Limit portfolio concentration",
      "Require an acceptable purchase price",
      "Review periodically rather than react to daily market noise",
    ],
    decisions: "Hold, Add, Reduce, Rebalance, or Exit",
  },
  {
    name: "Enterprising Investing",
    horizon: "Long term",
    purpose:
      "Pursue deeply researched opportunities that may offer stronger long-term returns.",
    appropriateFor:
      "Capital assigned to undervalued companies, selected credit opportunities, and market dislocations.",
    assetFocus: [
      "Undervalued public companies",
      "Temporarily misunderstood businesses",
      "Selected corporate bonds and special situations",
      "High-quality companies purchased with a margin of safety",
    ],
    direction: [
      "Require deeper financial and competitive research",
      "Separate temporary weakness from permanent impairment",
      "Define the investment case before allocating capital",
      "Limit position size when uncertainty is elevated",
    ],
    decisions: "Research, Prepare, Buy, Add, Hold, Reduce, or Exit",
  },
  {
    name: "Swing Opportunities",
    horizon: "Weeks to months",
    purpose:
      "Capture measured mid-term opportunities without disturbing the long-term portfolio.",
    appropriateFor:
      "A separately controlled portion of capital with clear entry, risk, and exit rules.",
    assetFocus: [
      "Stocks and exchange-traded securities",
      "Sector rotation and valuation recovery opportunities",
      "Earnings, credit, and market-condition changes",
      "Price moves supported by verified business or market evidence",
    ],
    direction: [
      "Define the entry range before action",
      "Set the maximum capital at risk",
      "Record the expected holding period",
      "Establish review and exit conditions in advance",
    ],
    decisions: "Prepare, Enter, Hold, Reduce, Exit, or Decline",
  },
] as const;

export default function InvestmentDirectionPage() {
  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Portfolio Direction</p>
          <h1>Choose how each portion of capital should work.</h1>
        </div>

        <p>
          Separate long-term protection, long-term opportunity, and mid-term
          trading so every decision has a clear purpose and time horizon.
        </p>
      </section>

      <section className="investo-metric-grid">
        {investmentDirections.map((direction) => (
          <article className="investo-card" key={direction.name}>
            <span className="investo-card-label">{direction.horizon}</span>
            <h2>{direction.name}</h2>
            <p>{direction.purpose}</p>

            <div className="investo-prepared-list">
              <div className="investo-prepared-row">
                <span>PURPOSE</span>
                <div>
                  <strong>Portfolio role</strong>
                  <small>{direction.appropriateFor}</small>
                </div>
              </div>

              <div className="investo-prepared-row">
                <span>ASSETS</span>
                <div>
                  <strong>Investment focus</strong>
                  {direction.assetFocus.map((item) => (
                    <small key={item}>{item}</small>
                  ))}
                </div>
              </div>

              <div className="investo-prepared-row">
                <span>RULES</span>
                <div>
                  <strong>Decision discipline</strong>
                  {direction.direction.map((item) => (
                    <small key={item}>{item}</small>
                  ))}
                </div>
              </div>

              <div className="investo-prepared-row">
                <span>ACTIONS</span>
                <div>
                  <strong>{direction.decisions}</strong>
                  <small>Every final investment decision requires human approval.</small>
                </div>
                <span className="investo-pill">Human approved</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="investo-work-grid">
        <article className="investo-card">
          <p className="investo-eyebrow">Portfolio Separation</p>
          <h2>Long-term investments and swing trades remain distinct.</h2>
          <p>
            A swing opportunity cannot silently become a long-term holding.
            A protective investment cannot be treated as a short-term trade.
            Each future recommendation will state its strategy, intended holding
            period, portfolio effect, and conditions for review.
          </p>
        </article>

        <article className="investo-card">
          <p className="investo-eyebrow">Decision Control</p>
          <h2>Investo prepares direction. You authorize action.</h2>
          <p>
            Research, market signals, and portfolio analysis may prepare a
            recommendation. No purchase, sale, allocation change, or trade may
            occur without your approval.
          </p>
        </article>
      </section>

      <section className="investo-section-stack">
        <article className="investo-card">
          <p className="investo-eyebrow">Next Portfolio Step</p>
          <h2>Review the holdings already recorded in Investo.</h2>
          <p>
            Existing portfolio records remain unchanged. Strategy assignments
            will be added later as an additional classification without replacing
            the current holdings structure.
          </p>

          <Link className="investo-pill" href="/v2/portfolio">
            Review Portfolio
          </Link>
        </article>
      </section>
    </InvestoProtectedPage>
  );
}
