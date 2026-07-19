import {
  CompanyResearchWorkspace,
} from "@/components/investo/research/CompanyResearchWorkspace";
import {
  requireInvestoUser,
} from "@/lib/investo/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResearchPage() {
  await requireInvestoUser();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <CompanyResearchWorkspace />
    </main>
  );
}
