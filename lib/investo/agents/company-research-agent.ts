import "server-only";

import {
  INVESTO_COMMITTEE_POLICY,
  INVESTO_INDEPENDENT_REVIEW_POLICY,
  INVESTO_PRIMARY_ANALYST_POLICY,
} from "@/lib/investo/ai/prompts";
import { runInvestoModel } from "@/lib/investo/ai/provider";
import { parseStructuredJson } from "@/lib/investo/ai/structured-json";
import {
  formatCompanyEvidencePacket,
} from "@/lib/investo/agents/company-research-evidence";
import {
  INVESTO_COMMITTEE_JSON_POLICY,
  INVESTO_COMPANY_RESEARCH_INSTRUCTION,
} from "@/lib/investo/agents/company-research-prompts";
import {
  validateCommitteeOutput,
} from "@/lib/investo/agents/company-research-output";
import type {
  CompanyResearchCommitteeOutput,
  CompanyResearchPipelineResult,
  CompanyResearchRequest,
} from "@/lib/investo/agents/company-research-types";

export async function runCompanyResearchPipeline(
  request: CompanyResearchRequest,
): Promise<CompanyResearchPipelineResult> {
  const evidencePacket =
    formatCompanyEvidencePacket(request);

  const primary = await runInvestoModel({
    agentName: "company-research-primary",
    purpose: "company_research",
    providerOverride: "openai",
    additionalPolicy:
      INVESTO_PRIMARY_ANALYST_POLICY,
    evidence: request.evidence,
    instruction: `
${INVESTO_COMPANY_RESEARCH_INSTRUCTION}

${evidencePacket}
`.trim(),
  });

  const independentReview = await runInvestoModel({
    agentName: "company-research-independent-review",
    purpose: "thesis_challenge",
    providerOverride: "anthropic",
    additionalPolicy:
      INVESTO_INDEPENDENT_REVIEW_POLICY,
    evidence: request.evidence,
    instruction: `
Independently challenge the following company analysis.

Company:
${request.companyName}

Primary analysis:
${primary.output}

Original evidence packet:
${evidencePacket}

Determine:
- which claims are supported;
- which claims are assumptions;
- what important evidence is missing;
- the strongest counterargument;
- valuation or balance-sheet concerns;
- whether the primary conclusion should be accepted, qualified, or rejected.

Do not merely rewrite the primary analysis.
`.trim(),
  });

  const committee = await runInvestoModel({
    agentName: "company-research-committee",
    purpose: "investment_committee",
    providerOverride: "openai",
    additionalPolicy: [
      INVESTO_COMMITTEE_POLICY,
      INVESTO_COMMITTEE_JSON_POLICY,
    ].join("\n\n"),
    evidence: request.evidence,
    instruction: `
Prepare the final structured company research decision.

Company:
${request.companyName}

Ticker:
${request.ticker ?? "Not provided"}

Primary analysis:
${primary.output}

Independent risk review:
${independentReview.output}

Original evidence packet:
${evidencePacket}

Reconcile the two analyses honestly. Do not hide disagreement.
Return only the required JSON object.
`.trim(),
  });

  const parsed =
    parseStructuredJson<CompanyResearchCommitteeOutput>(
      committee.output,
    );

  const validated = validateCommitteeOutput(parsed);

  return {
    primaryAnalysis: {
      provider: primary.provider,
      model: primary.model,
      output: primary.output,
    },

    independentReview: {
      provider: independentReview.provider,
      model: independentReview.model,
      output: independentReview.output,
    },

    committee: {
      provider: committee.provider,
      model: committee.model,
      output: validated,
    },
  };
}
