import type {
  CompanyResearchRequest,
} from "@/lib/investo/agents/company-research-types";

function renderField(
  label: string,
  value?: string,
) {
  return value
    ? `${label}: ${value}`
    : `${label}: Not provided`;
}

export function formatCompanyEvidencePacket(
  request: CompanyResearchRequest,
) {
  const evidence = request.evidence
    .map((item, index) => {
      return [
        `Evidence item ${index + 1}`,
        renderField("Title", item.title),
        renderField("Source", item.source),
        renderField("Source URL", item.sourceUrl),
        renderField("Published", item.publishedAt),
        renderField("Data as of", item.dataAsOf),
        renderField("Evidence", item.note),
      ].join("\n");
    })
    .join("\n\n");

  return `
Company: ${request.companyName}
Ticker: ${request.ticker ?? "Not provided"}
Research question:
${request.researchQuestion ?? "Assess the company as a long-term investment candidate."}

Verified evidence packet:
${evidence}

Evidence handling requirements:
- Use only the evidence included above.
- Do not invent missing financial figures or market prices.
- Treat URLs and source labels as references, not as proof that unseen content exists.
- Identify missing evidence rather than filling gaps through assumptions.
`.trim();
}
