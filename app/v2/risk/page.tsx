import type { Metadata } from "next";
import { InvestoProtectedPage } from "@/components/investo/protected-page";

export const metadata: Metadata = {
  title: "Capital Protection",
};

export default function Page() {
  return (
    <InvestoProtectedPage>
      <section className="investo-page-heading">
        <div>
          <p className="investo-eyebrow">Investo</p>
          <h1>Capital Protection</h1>
        </div>

        <p>Concentration, liquidity, bonds, commodities, geopolitical exposure, and downside scenarios.</p>
      </section>

      <article className="investo-card">
        <p className="investo-eyebrow">Foundation Ready</p>
        <h2>This private workspace is ready for the next build phase.</h2>
        <p>
          Data connection, database records, analysis agents, and executive
          decision workflows will be added without exposing this route publicly.
        </p>
      </article>
    </InvestoProtectedPage>
  );
}
