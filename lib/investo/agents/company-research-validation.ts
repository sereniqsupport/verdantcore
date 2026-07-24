import type { CompanyResearchRequest } from "@/lib/investo/agents/company-research-types";
import type { InvestoAgentEvidence } from "@/lib/investo/ai/types";

const MAX_COMPANY_NAME_LENGTH = 160;
const MAX_TICKER_LENGTH = 20;
const MAX_QUESTION_LENGTH = 2000;
const MAX_EVIDENCE_ITEMS = 30;
const MAX_EVIDENCE_FIELD_LENGTH = 8000;
const MAX_TOTAL_EVIDENCE_CHARACTERS = 90000;

function readOptionalString(
  value: unknown,
  field: string,
  maximumLength: number,
) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    return undefined;
  }

  if (normalized.length > maximumLength) {
    throw new Error(`${field} exceeds the ${maximumLength}-character limit.`);
  }

  return normalized;
}

function readRequiredString(
  value: unknown,
  field: string,
  maximumLength: number,
) {
  const normalized = readOptionalString(value, field, maximumLength);

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function readEvidenceString(value: unknown, field: string) {
  return readOptionalString(value, field, MAX_EVIDENCE_FIELD_LENGTH);
}

function validateEvidenceItem(
  value: unknown,
  index: number,
): InvestoAgentEvidence {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`evidence[${index}] must be an object.`);
  }

  const item = value as Record<string, unknown>;

  return {
    title: readRequiredString(item.title, `evidence[${index}].title`, 500),
    source: readEvidenceString(item.source, `evidence[${index}].source`),
    sourceUrl: readEvidenceString(
      item.sourceUrl,
      `evidence[${index}].sourceUrl`,
    ),
    publishedAt: readEvidenceString(
      item.publishedAt,
      `evidence[${index}].publishedAt`,
    ),
    dataAsOf: readEvidenceString(item.dataAsOf, `evidence[${index}].dataAsOf`),
    note: readEvidenceString(item.note, `evidence[${index}].note`),
  };
}

export function validateCompanyResearchRequest(
  value: unknown,
): CompanyResearchRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The company research request must be an object.");
  }

  const input = value as Record<string, unknown>;

  if (!Array.isArray(input.evidence)) {
    throw new Error("evidence must be an array of verified source records.");
  }

  if (input.evidence.length > MAX_EVIDENCE_ITEMS) {
    throw new Error(
      `No more than ${MAX_EVIDENCE_ITEMS} evidence records are allowed per request.`,
    );
  }

  const evidence = input.evidence.map(validateEvidenceItem);

  const totalEvidenceCharacters = evidence.reduce(
    (total, item) =>
      total +
      Object.values(item).reduce(
        (itemTotal, field) =>
          itemTotal + (typeof field === "string" ? field.length : 0),
        0,
      ),
    0,
  );

  if (totalEvidenceCharacters > MAX_TOTAL_EVIDENCE_CHARACTERS) {
    throw new Error(
      `The evidence packet exceeds the ${MAX_TOTAL_EVIDENCE_CHARACTERS}-character limit.`,
    );
  }

  return {
    companyName: readRequiredString(
      input.companyName,
      "companyName",
      MAX_COMPANY_NAME_LENGTH,
    ),
    ticker: readOptionalString(
      input.ticker,
      "ticker",
      MAX_TICKER_LENGTH,
    )?.toUpperCase(),
    researchQuestion: readOptionalString(
      input.researchQuestion,
      "researchQuestion",
      MAX_QUESTION_LENGTH,
    ),
    evidence,
  };
}
