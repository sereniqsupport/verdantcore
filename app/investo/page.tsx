import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Investo | Clearer Investment Decisions",
  description:
    "Investo helps private investors research companies, evaluate risk, compare evidence, and make more disciplined capital allocation decisions.",
  robots: {
    index: true,
    follow: true,
  },
};

const decisionAreas = [
  {
    number: "01",
    title: "Understand the business",
    description:
      "See how a company makes money, what supports its position, and where its strength may be overstated.",
  },
  {
    number: "02",
    title: "Examine financial strength",
    description:
      "Review the evidence behind revenue quality, cash generation, balance-sheet resilience, and capital allocation.",
  },
  {
    number: "03",
    title: "See the downside clearly",
    description:
      "Identify the risks, missing evidence, and conditions that could weaken or break the investment case.",
  },
  {
    number: "04",
    title: "Make a deliberate decision",
    description:
      "Turn research into a documented decision you can review, challenge, and measure over time.",
  },
];

const principles = [
  "Evidence before conviction",
  "Downside before excitement",
  "Business quality before market noise",
  "Human judgment before capital is committed",
];

export default function InvestoPublicPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/investo">
          <span className={styles.mark}>I</span>

          <span className={styles.brandText}>
            <strong>Investo</strong>
            <small>Private Investment Research</small>
          </span>
        </Link>

        <nav aria-label="Investo access" className={styles.navigation}>
          <Link className={styles.signInLink} href="/v2/login">
            Sign in
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Private Investment Research</p>

          <h1>
            Make investment decisions with clearer evidence and less market
            noise.
          </h1>

          <p className={styles.heroSummary}>
            Investo helps you examine companies, challenge assumptions, protect
            capital, and document the reasoning behind every investment
            decision.
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/v2/login">
              Enter Investo
            </Link>

            <a className={styles.secondaryButton} href="#how-it-helps">
              See how it helps
            </a>
          </div>

          <p className={styles.accessNote}>
            Private access only. Every final investment decision remains yours.
          </p>
        </div>

        <aside className={styles.decisionCard}>
          <p className={styles.cardLabel}>A clearer decision process</p>

          <div className={styles.decisionQuestion}>
            <span>Before capital is committed</span>
            <strong>What must be true for this investment to succeed?</strong>
          </div>

          <div className={styles.cardDivider} />

          <dl className={styles.decisionSignals}>
            <div>
              <dt>Business quality</dt>
              <dd>Examined</dd>
            </div>

            <div>
              <dt>Financial strength</dt>
              <dd>Reviewed</dd>
            </div>

            <div>
              <dt>Principal risks</dt>
              <dd>Visible</dd>
            </div>

            <div>
              <dt>Final authority</dt>
              <dd>You</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className={styles.statement}>
        <p>
          Investing is not only about finding opportunity. It is also about
          knowing what you may be missing before your money is exposed.
        </p>
      </section>

      <section className={styles.helpSection} id="how-it-helps">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>How Investo helps</p>
          <h2>A disciplined path from company research to human judgment.</h2>
        </div>

        <div className={styles.areaGrid}>
          {decisionAreas.map((area) => (
            <article className={styles.areaCard} key={area.number}>
              <span>{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.researchSection}>
        <div className={styles.researchCopy}>
          <p className={styles.eyebrow}>Research without false certainty</p>

          <h2>Built to help you think, not to make decisions for you.</h2>

          <p>
            Investo organizes company evidence, competing viewpoints, financial
            concerns, valuation questions, and the factors that could change
            your conclusion.
          </p>

          <p>
            It prepares the research. You decide whether the evidence is strong
            enough to act.
          </p>
        </div>

        <div className={styles.principles}>
          {principles.map((principle) => (
            <div className={styles.principle} key={principle}>
              <span aria-hidden="true">✓</span>
              <p>{principle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.outcomesSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What you gain</p>
          <h2>
            A better record of why you invested and what could prove you wrong.
          </h2>
        </div>

        <div className={styles.outcomeGrid}>
          <article>
            <strong>Clearer company research</strong>
            <p>
              Bring the most important business, financial, competitive, and
              risk evidence into one review.
            </p>
          </article>

          <article>
            <strong>More balanced judgment</strong>
            <p>
              Compare supporting and opposing views before allowing confidence
              to become commitment.
            </p>
          </article>

          <article>
            <strong>Stronger capital discipline</strong>
            <p>
              Keep a written record of the assumptions, risks, and conditions
              behind each decision.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>Private access</p>
          <h2>Enter Investo and begin with the evidence.</h2>
          <p>
            Review your research, portfolio decisions, risks, and investment
            record in one private workspace.
          </p>
        </div>

        <Link className={styles.primaryButton} href="/v2/login">
          Sign in to Investo
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span className={styles.mark}>I</span>
          <strong>Investo</strong>
        </div>

        <p>
          Investment research supports judgment. It does not replace it or
          guarantee financial results.
        </p>

        <Link href="/">Verdant Core</Link>
      </footer>
    </main>
  );
}
