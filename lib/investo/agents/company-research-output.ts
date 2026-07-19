import type {
  AgreementAssessment,
  CompanyResearchCommitteeOutput,
  HumanAction,
  ResearchConclusion,
} from "@/lib/investo/agents/company-research-types";

function requireObject(
  value: unknown,
  field: string,
): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error(`${field} must be an object.`);
  }

  return value as Record<string, unknown>;
}

function requireString(
  value: unknown,
  field: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value.trim();
}

function requireNullableString(
  value: unknown,
  field: string,
): string | null {
  if (value === null) {
    return null;
  }

  return requireString(value, field);
}

function requireStringArray(
  value: unknown,
  field: string,
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${field} must be an array.`);
  }

  return value.map((item, index) =>
    requireString(item, `${field}[${index}]`),
  );
}

function requireEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T {
  if (
    typeof value !== "string" ||
    !allowed.includes(value as T)
  ) {
    throw new Error(
      `${field} must be one of: ${allowed.join(", ")}.`,
    );
  }

  return value as T;
}

export function validateCommitteeOutput(
  value: unknown,
): CompanyResearchCommitteeOutput {
  const root = requireObject(
    value,
    "committee output",
  );

  const businessQuality = requireObject(
    root.businessQuality,
    "businessQuality",
  );

  const competitivePosition = requireObject(
    root.competitivePosition,
    "competitivePosition",
  );

  const financialStrength = requireObject(
    root.financialStrength,
    "financialStrength",
  );

  const capitalAllocation = requireObject(
    root.capitalAllocation,
    "capitalAllocation",
  );

  const valuationReadiness = requireObject(
    root.valuationReadiness,
    "valuationReadiness",
  );

  const modelAgreement = requireObject(
    root.modelAgreement,
    "modelAgreement",
  );

  const proposedHumanAction = requireObject(
    root.proposedHumanAction,
    "proposedHumanAction",
  );

  const authorityBoundary = requireObject(
    root.authorityBoundary,
    "authorityBoundary",
  );

  if (authorityBoundary.humanApprovalRequired !== true) {
    throw new Error(
      "humanApprovalRequired must remain true.",
    );
  }

  if (authorityBoundary.transactionExecuted !== false) {
    throw new Error(
      "transactionExecuted must remain false.",
    );
  }

  return {
    companyName: requireString(
      root.companyName,
      "companyName",
    ),

    ticker: requireNullableString(
      root.ticker,
      "ticker",
    ),

    analysisDate: requireString(
      root.analysisDate,
      "analysisDate",
    ),

    evidenceAsOf: requireNullableString(
      root.evidenceAsOf,
      "evidenceAsOf",
    ),

    executiveSummary: requireString(
      root.executiveSummary,
      "executiveSummary",
    ),

    businessDescription: requireString(
      root.businessDescription,
      "businessDescription",
    ),

    businessQuality: {
      assessment: requireEnum(
        businessQuality.assessment,
        "businessQuality.assessment",
        ["strong", "mixed", "weak", "unclear"] as const,
      ),
      rationale: requireString(
        businessQuality.rationale,
        "businessQuality.rationale",
      ),
    },

    competitivePosition: {
      assessment: requireEnum(
        competitivePosition.assessment,
        "competitivePosition.assessment",
        [
          "durable",
          "moderate",
          "fragile",
          "unclear",
        ] as const,
      ),
      advantages: requireStringArray(
        competitivePosition.advantages,
        "competitivePosition.advantages",
      ),
      vulnerabilities: requireStringArray(
        competitivePosition.vulnerabilities,
        "competitivePosition.vulnerabilities",
      ),
    },

    financialStrength: {
      assessment: requireEnum(
        financialStrength.assessment,
        "financialStrength.assessment",
        ["strong", "mixed", "weak", "unclear"] as const,
      ),
      strengths: requireStringArray(
        financialStrength.strengths,
        "financialStrength.strengths",
      ),
      concerns: requireStringArray(
        financialStrength.concerns,
        "financialStrength.concerns",
      ),
    },

    capitalAllocation: {
      assessment: requireEnum(
        capitalAllocation.assessment,
        "capitalAllocation.assessment",
        [
          "disciplined",
          "mixed",
          "poor",
          "unclear",
        ] as const,
      ),
      rationale: requireString(
        capitalAllocation.rationale,
        "capitalAllocation.rationale",
      ),
    },

    valuationReadiness: {
      status: requireEnum(
        valuationReadiness.status,
        "valuationReadiness.status",
        [
          "ready",
          "partially_ready",
          "not_ready",
        ] as const,
      ),
      missingInputs: requireStringArray(
        valuationReadiness.missingInputs,
        "valuationReadiness.missingInputs",
      ),
    },

    principalRisks: requireStringArray(
      root.principalRisks,
      "principalRisks",
    ),

    thesisBreakers: requireStringArray(
      root.thesisBreakers,
      "thesisBreakers",
    ),

    missingEvidence: requireStringArray(
      root.missingEvidence,
      "missingEvidence",
    ),

    modelAgreement: {
      status: requireEnum<AgreementAssessment>(
        modelAgreement.status,
        "modelAgreement.status",
        [
          "material_agreement",
          "qualified_agreement",
          "material_disagreement",
        ] as const,
      ),
      agreedPoints: requireStringArray(
        modelAgreement.agreedPoints,
        "modelAgreement.agreedPoints",
      ),
      disputedPoints: requireStringArray(
        modelAgreement.disputedPoints,
        "modelAgreement.disputedPoints",
      ),
    },

    conclusion: requireEnum<ResearchConclusion>(
      root.conclusion,
      "conclusion",
      [
        "attractive",
        "watch",
        "insufficient_evidence",
        "avoid",
      ] as const,
    ),

    proposedHumanAction: {
      action: requireEnum<HumanAction>(
        proposedHumanAction.action,
        "proposedHumanAction.action",
        [
          "continue_research",
          "add_to_watchlist",
          "prepare_valuation",
          "consider_initial_position",
          "consider_addition",
          "hold",
          "avoid",
          "no_action",
        ] as const,
      ),
      rationale: requireString(
        proposedHumanAction.rationale,
        "proposedHumanAction.rationale",
      ),
      conditionsBeforeAction: requireStringArray(
        proposedHumanAction.conditionsBeforeAction,
        "proposedHumanAction.conditionsBeforeAction",
      ),
    },

    authorityBoundary: {
      humanApprovalRequired: true,
      transactionExecuted: false,
    },
  };
}
