import { CompanyResearchWorkspace } from "@/components/investo/research/CompanyResearchWorkspace";
import { ResearchHistory } from "@/components/investo/research/ResearchHistory";
import { requireInvestoUser } from "@/lib/investo/auth";
import { getResearchHistory } from "@/lib/investo/research/repository";
import type { InvestoResearchReport } from "@/lib/investo/database/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResearchPage() {
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
    <main className="mx-auto w-full max-w-7xl space-y-10 px-5 py-8 md:px-8 md:py-10">
      <CompanyResearchWorkspace />

      <ResearchHistory reports={reports} />
    </main>
  );
}
