import { CompanyResearchWorkspace } from "@/components/investo/research/CompanyResearchWorkspace";
import { ResearchHistory } from "@/components/investo/research/ResearchHistory";
import { requireInvestoUser } from "@/lib/investo/auth";
import { getResearchHistory } from "@/lib/investo/research/repository";
import type { InvestoResearchReport } from "@/lib/investo/database/types";

import { InvestoProtectedPage } from "@/components/investo/protected-page";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const parameters = await searchParams;
  const initialTicker =
    typeof parameters.ticker === "string"
      ? parameters.ticker
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9.-]/g, "")
          .slice(0, 12)
      : "";

  const { supabase, user } = await requireInvestoUser();

  let reports: InvestoResearchReport[] = [];

  try {
    reports = await getResearchHistory({
      supabase,
      userId: user.id,
    });
  } catch (error) {
    console.error("Unable to load Investo research history:", error);
  }

  return (
    <InvestoProtectedPage>
      <main className="investo-research-page w-full space-y-10">
        <CompanyResearchWorkspace initialTicker={initialTicker} />

        <ResearchHistory reports={reports} />
      </main>
    </InvestoProtectedPage>
  );
}
