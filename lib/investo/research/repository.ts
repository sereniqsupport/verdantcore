import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { asInvestoDatabaseClient } from "@/lib/investo/database/client";
import type {
  InvestoAction,
  InvestoConviction,
  InvestoResearchReport,
  InvestoResearchReportInsert,
  Json,
} from "@/lib/investo/database/types";
import type { CompanyResearchPipelineResult } from "@/lib/investo/agents/company-research-types";
import type {
  HumanActionResult,
  ResearchHumanAction,
} from "@/lib/investo/research/types";

type CommitteeOutput = CompanyResearchPipelineResult["committee"]["output"];

type SaveCompletedResearchInput = {
  supabase: SupabaseClient;
  userId: string;
  evidence: unknown[];
  result: CompanyResearchPipelineResult;
};

type ResearchMetadata = {
  companyName: string;
  conclusion: string;
  proposedAction: string;
  proposedActionRationale: string;
  conditionsBeforeAction: unknown[];
  modelAgreement: unknown;
  committeeOutput: CommitteeOutput;
};

function normalizeSymbol(
  ticker: string | null | undefined,
  companyName: string,
) {
  const symbol = ticker?.trim().toUpperCase();

  if (symbol) {
    return symbol;
  }

  return companyName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function scoreFromAssessment(
  assessment: string | null | undefined,
): number | null {
  if (!assessment) {
    return null;
  }

  const normalized = assessment.trim().toLowerCase().replace(/\s+/g, "_");

  const scores: Record<string, number> = {
    exceptional: 95,
    strong: 88,
    durable: 88,
    attractive: 85,
    disciplined: 85,
    material_agreement: 85,
    high: 82,
    moderate: 65,
    mixed: 60,
    watch: 58,
    qualified_agreement: 58,
    partially_ready: 55,
    weak: 35,
    fragile: 32,
    avoid: 25,
    poor: 25,
    not_ready: 25,
    material_disagreement: 35,
    insufficient_evidence: 40,
    unclear: 40,
  };

  return scores[normalized] ?? null;
}

function toJson(value: unknown): Json {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Json;
}

function stringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function metadataFromReport(report: InvestoResearchReport): ResearchMetadata {
  if (!report.management_analysis) {
    throw new Error(
      "The saved research report does not contain its committee metadata.",
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(report.management_analysis);
  } catch {
    throw new Error("The saved research committee metadata could not be read.");
  }

  if (!parsed || typeof parsed !== "object" || !("committeeOutput" in parsed)) {
    throw new Error("The saved research committee metadata is incomplete.");
  }

  return parsed as ResearchMetadata;
}

function determineAction(
  conclusion: string,
  proposedAction: string,
): InvestoAction {
  const normalized = `${conclusion} ${proposedAction}`.toLowerCase();

  if (normalized.includes("avoid") || normalized.includes("reject")) {
    return "reject";
  }

  if (normalized.includes("initial") || normalized.includes("buy")) {
    return "buy";
  }

  if (normalized.includes("add")) {
    return "add";
  }

  if (normalized.includes("research") || normalized.includes("evidence")) {
    return "research";
  }

  if (normalized.includes("watch") || normalized.includes("wait")) {
    return "watch";
  }

  return "hold";
}

function determineConviction(conclusion: string): InvestoConviction {
  const normalized = conclusion.toLowerCase();

  if (
    normalized.includes("exceptional") ||
    normalized.includes("highly attractive")
  ) {
    return "exceptional";
  }

  if (normalized.includes("attractive") || normalized.includes("strong")) {
    return "high";
  }

  if (normalized.includes("watch") || normalized.includes("mixed")) {
    return "moderate";
  }

  return "low";
}

function determinePriority(conclusion: string): number {
  const normalized = conclusion.toLowerCase();

  if (normalized.includes("exceptional") || normalized.includes("attractive")) {
    return 1;
  }

  if (normalized.includes("watch") || normalized.includes("mixed")) {
    return 2;
  }

  return 3;
}

export async function saveCompletedResearch({
  supabase,
  userId,
  evidence,
  result,
}: SaveCompletedResearchInput): Promise<InvestoResearchReport> {
  const client = asInvestoDatabaseClient(supabase);
  const output = result.committee.output;

  const metadata: ResearchMetadata = {
    companyName: output.companyName,
    conclusion: output.conclusion,
    proposedAction: output.proposedHumanAction.action,
    proposedActionRationale: output.proposedHumanAction.rationale,
    conditionsBeforeAction: output.proposedHumanAction.conditionsBeforeAction,
    modelAgreement: output.modelAgreement,
    committeeOutput: output,
  };

  const insert: InvestoResearchReportInsert = {
    user_id: userId,
    symbol: normalizeSymbol(output.ticker, output.companyName),
    report_type: "company_research_committee",
    title: `${output.companyName} Investment Committee Review`,
    executive_summary: output.executiveSummary,
    business_description: output.businessDescription,
    moat_analysis: stringify(output.competitivePosition),
    management_analysis: stringify(metadata),
    capital_allocation_analysis: stringify(output.capitalAllocation),
    financial_strength_analysis: stringify(output.financialStrength),
    valuation_analysis: stringify(output.valuationReadiness),
    downside_analysis: stringify({
      principalRisks: output.principalRisks,
      thesisBreakers: output.thesisBreakers,
      missingEvidence: output.missingEvidence,
    }),
    catalysts: [],
    risks: toJson(output.principalRisks),
    evidence: toJson(evidence),
    business_quality_score: scoreFromAssessment(
      output.businessQuality.assessment,
    ),
    moat_score: scoreFromAssessment(output.competitivePosition.assessment),
    balance_sheet_score: scoreFromAssessment(
      output.financialStrength.assessment,
    ),
    capital_allocation_score: scoreFromAssessment(
      output.capitalAllocation.assessment,
    ),
    valuation_score: scoreFromAssessment(output.valuationReadiness.status),
    overall_score: scoreFromAssessment(output.conclusion),
    data_as_of: output.evidenceAsOf ?? output.analysisDate ?? null,
  };

  const resultRecord = await client
    .from("investo_research_reports")
    .insert(insert)
    .select("*")
    .single();

  if (resultRecord.error || !resultRecord.data) {
    throw new Error(
      resultRecord.error?.message ??
        "The completed research report could not be saved.",
    );
  }

  return resultRecord.data;
}

export async function getResearchHistory({
  supabase,
  userId,
  limit = 20,
}: {
  supabase: SupabaseClient;
  userId: string;
  limit?: number;
}) {
  const client = asInvestoDatabaseClient(supabase);

  const result = await client
    .from("investo_research_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getResearchReport({
  supabase,
  userId,
  reportId,
}: {
  supabase: SupabaseClient;
  userId: string;
  reportId: string;
}) {
  const client = asInvestoDatabaseClient(supabase);

  const result = await client
    .from("investo_research_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function recordResearchHumanAction({
  supabase,
  userId,
  reportId,
  action,
  note,
}: {
  supabase: SupabaseClient;
  userId: string;
  reportId: string;
  action: ResearchHumanAction;
  note?: string;
}): Promise<HumanActionResult> {
  const client = asInvestoDatabaseClient(supabase);

  const reportResult = await client
    .from("investo_research_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .single();

  if (reportResult.error || !reportResult.data) {
    throw new Error(
      reportResult.error?.message ?? "The research report was not found.",
    );
  }

  const report = reportResult.data;
  const metadata = metadataFromReport(report);

  if (action === "add_to_watchlist") {
    const watchlistResult = await client
      .from("investo_watchlist")
      .upsert(
        {
          user_id: userId,
          symbol: report.symbol,
          company_name: metadata.companyName,
          stage: "research",
          priority: determinePriority(metadata.conclusion),
          discovery_reason: report.executive_summary,
          research_notes: note ?? metadata.proposedActionRationale,
        },
        {
          onConflict: "user_id,symbol",
        },
      )
      .select("id")
      .single();

    if (watchlistResult.error || !watchlistResult.data) {
      throw new Error(
        watchlistResult.error?.message ??
          "The company could not be added to the Watchlist.",
      );
    }

    return {
      action,
      researchReportId: report.id,
      watchlistId: watchlistResult.data.id,
      transactionExecuted: false,
    };
  }

  const preparedAction = determineAction(
    metadata.conclusion,
    metadata.proposedAction,
  );

  const recommendationResult = await client
    .from("investo_recommendations")
    .insert({
      user_id: userId,
      research_report_id: report.id,
      symbol: report.symbol,
      action: preparedAction,
      conviction: determineConviction(metadata.conclusion),
      priority: determinePriority(metadata.conclusion),
      rationale:
        metadata.proposedActionRationale ||
        report.executive_summary ||
        "Human review is required.",
      key_risks: report.risks,
      thesis_break_conditions: toJson(metadata.conditionsBeforeAction),
      supporting_evidence: report.evidence,
      requires_human_approval: true,
      data_as_of: report.data_as_of,
    })
    .select("id")
    .single();

  if (recommendationResult.error || !recommendationResult.data) {
    throw new Error(
      recommendationResult.error?.message ??
        "The recommendation could not be prepared.",
    );
  }

  const decisionResult = await client
    .from("investo_decisions")
    .insert({
      user_id: userId,
      recommendation_id: recommendationResult.data.id,
      symbol: report.symbol,
      action: preparedAction,
      status: action === "record_no_action" ? "declined" : "prepared",
      decision_note:
        note ??
        (action === "record_no_action"
          ? "No investment action approved."
          : "Prepared for human review. No transaction has been executed."),
    })
    .select("id")
    .single();

  if (decisionResult.error || !decisionResult.data) {
    throw new Error(
      decisionResult.error?.message ??
        "The decision record could not be created.",
    );
  }

  return {
    action,
    researchReportId: report.id,
    recommendationId: recommendationResult.data.id,
    decisionId: decisionResult.data.id,
    transactionExecuted: false,
  };
}

export async function getWatchlist({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const client = asInvestoDatabaseClient(supabase);

  const result = await client
    .from("investo_watchlist")
    .select("*")
    .eq("user_id", userId)
    .order("priority", {
      ascending: true,
    })
    .order("updated_at", {
      ascending: false,
    });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function getDecisionQueue({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const client = asInvestoDatabaseClient(supabase);

  const result = await client
    .from("investo_decisions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
