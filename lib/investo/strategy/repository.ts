import type { SupabaseClient } from "@supabase/supabase-js";

export type InvestoStrategyCode =
  | "protective"
  | "enterprising"
  | "swing"
  | "reserve";

export type StrategySleeveRecord = {
  id: string;
  code: InvestoStrategyCode;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
};

export type StrategyPolicyRecord = {
  id: string;
  strategy_sleeve_id: string;
  target_allocation_percent: number;
  maximum_allocation_percent: number;
  maximum_position_percent: number;
  minimum_cash_reserve_percent: number;
  expected_holding_period: string;
  review_cadence: string;
  minimum_margin_of_safety_percent: number;
  human_approval_required: boolean;
};

export type StrategyPositionControlRecord = {
  id: string;
  strategy_sleeve_id: string;
  minimum_position_percent: number;
  standard_position_percent: number;
  maximum_position_percent: number;
  maximum_sector_percent: number;
  maximum_single_asset_risk_percent: number;
  human_approval_required: boolean;
};

export type HoldingAssignmentRecord = {
  id: string;
  holding_id: string;
  strategy_sleeve_id: string;
};

export type HoldingValueRecord = {
  id: string;
  quantity: number;
  current_price: number | null;
  average_cost: number | null;
};

export type PreparedConditionRecord = {
  id: string;
  strategy_sleeve_id: string;
  condition_type: string;
  title: string;
  status: string;
  priority: number;
};

export type MarketSignalRecord = {
  id: string;
  strategy_sleeve_id: string | null;
  title: string;
  direction: string;
  severity: number;
  status: string;
};

export type StrategyDirectionRow = {
  sleeve: StrategySleeveRecord;
  policy: StrategyPolicyRecord | null;
  positionControl: StrategyPositionControlRecord | null;
  assignedHoldingCount: number;
  assignedMarketValue: number;
  portfolioAllocationPercent: number;
  activeConditionCount: number;
  activeSignalCount: number;
};

export type StrategyDirectionOverview = {
  portfolioId: string | null;
  portfolioName: string | null;
  totalPortfolioValue: number;
  unassignedHoldingCount: number;
  strategies: StrategyDirectionRow[];
  databaseReady: boolean;
};

type QueryResult<T> = {
  data: T[] | null;
  error: {
    message: string;
    code?: string;
  } | null;
};

function numeric(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function missingRelation(error: QueryResult<unknown>["error"]): boolean {
  return Boolean(
    error &&
      (
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message.toLowerCase().includes("does not exist") ||
        error.message.toLowerCase().includes("schema cache")
      ),
  );
}

export async function loadStrategyDirectionOverview(
  supabase: SupabaseClient,
  userId: string,
): Promise<StrategyDirectionOverview> {
  const portfolioResult = await supabase
    .from("investo_portfolios")
    .select("id,name")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (portfolioResult.error) {
    throw new Error(portfolioResult.error.message);
  }

  if (!portfolioResult.data) {
    return {
      portfolioId: null,
      portfolioName: null,
      totalPortfolioValue: 0,
      unassignedHoldingCount: 0,
      strategies: [],
      databaseReady: true,
    };
  }

  const portfolioId = String(portfolioResult.data.id);
  const portfolioName = String(portfolioResult.data.name);

  const bootstrapResult = await supabase.rpc(
    "investo_bootstrap_strategy_sleeves",
    {
      selected_portfolio_id: portfolioId,
    },
  );

  if (bootstrapResult.error && !missingRelation(bootstrapResult.error)) {
    throw new Error(bootstrapResult.error.message);
  }

  const [
    sleeveResult,
    policyResult,
    positionControlResult,
    assignmentResult,
    holdingResult,
    conditionResult,
    signalResult,
  ] = await Promise.all([
    supabase
      .from("investo_strategy_sleeves")
      .select(
        "id,code,name,description,display_order,is_active",
      )
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    supabase
      .from("investo_strategy_policies")
      .select(
        [
          "id",
          "strategy_sleeve_id",
          "target_allocation_percent",
          "maximum_allocation_percent",
          "maximum_position_percent",
          "minimum_cash_reserve_percent",
          "expected_holding_period",
          "review_cadence",
          "minimum_margin_of_safety_percent",
          "human_approval_required",
        ].join(","),
      )
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId)
      .eq("is_active", true),

    supabase
      .from("investo_position_sizing_controls")
      .select(
        [
          "id",
          "strategy_sleeve_id",
          "minimum_position_percent",
          "standard_position_percent",
          "maximum_position_percent",
          "maximum_sector_percent",
          "maximum_single_asset_risk_percent",
          "human_approval_required",
        ].join(","),
      )
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId)
      .eq("is_active", true),

    supabase
      .from("investo_holding_strategy_assignments")
      .select("id,holding_id,strategy_sleeve_id")
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId),

    supabase
      .from("investo_holdings")
      .select("id,quantity,current_price,average_cost")
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId),

    supabase
      .from("investo_prepared_conditions")
      .select(
        "id,strategy_sleeve_id,condition_type,title,status,priority",
      )
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId)
      .in("status", ["prepared", "active", "met"]),

    supabase
      .from("investo_market_signals")
      .select(
        "id,strategy_sleeve_id,title,direction,severity,status",
      )
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId)
      .eq("status", "active"),
  ]);

  const relationResults = [
    sleeveResult,
    policyResult,
    positionControlResult,
    assignmentResult,
    conditionResult,
    signalResult,
  ] as QueryResult<unknown>[];

  if (relationResults.some((result) => missingRelation(result.error))) {
    return {
      portfolioId,
      portfolioName,
      totalPortfolioValue: 0,
      unassignedHoldingCount: 0,
      strategies: [],
      databaseReady: false,
    };
  }

  for (const result of [
    sleeveResult,
    policyResult,
    positionControlResult,
    assignmentResult,
    holdingResult,
    conditionResult,
    signalResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const sleeves =
    (sleeveResult.data ?? []) as unknown as StrategySleeveRecord[];

  const policies =
    (policyResult.data ?? []) as unknown as StrategyPolicyRecord[];

  const controls =
    (positionControlResult.data ??
      []) as unknown as StrategyPositionControlRecord[];

  const assignments =
    (assignmentResult.data ??
      []) as unknown as HoldingAssignmentRecord[];

  const holdings =
    (holdingResult.data ?? []) as unknown as HoldingValueRecord[];

  const conditions =
    (conditionResult.data ??
      []) as unknown as PreparedConditionRecord[];

  const signals =
    (signalResult.data ?? []) as unknown as MarketSignalRecord[];

  const holdingsById = new Map(
    holdings.map((holding) => [holding.id, holding]),
  );

  const assignedHoldingIds = new Set(
    assignments.map((assignment) => assignment.holding_id),
  );

  const totalPortfolioValue = holdings.reduce((total, holding) => {
    const price =
      numeric(holding.current_price) || numeric(holding.average_cost);

    return total + numeric(holding.quantity) * price;
  }, 0);

  const strategies = sleeves.map((sleeve) => {
    const sleeveAssignments = assignments.filter(
      (assignment) => assignment.strategy_sleeve_id === sleeve.id,
    );

    const assignedMarketValue = sleeveAssignments.reduce(
      (total, assignment) => {
        const holding = holdingsById.get(assignment.holding_id);

        if (!holding) {
          return total;
        }

        const price =
          numeric(holding.current_price) || numeric(holding.average_cost);

        return total + numeric(holding.quantity) * price;
      },
      0,
    );

    return {
      sleeve,
      policy:
        policies.find(
          (policy) => policy.strategy_sleeve_id === sleeve.id,
        ) ?? null,
      positionControl:
        controls.find(
          (control) => control.strategy_sleeve_id === sleeve.id,
        ) ?? null,
      assignedHoldingCount: sleeveAssignments.length,
      assignedMarketValue,
      portfolioAllocationPercent:
        totalPortfolioValue > 0
          ? (assignedMarketValue / totalPortfolioValue) * 100
          : 0,
      activeConditionCount: conditions.filter(
        (condition) => condition.strategy_sleeve_id === sleeve.id,
      ).length,
      activeSignalCount: signals.filter(
        (signal) => signal.strategy_sleeve_id === sleeve.id,
      ).length,
    };
  });

  return {
    portfolioId,
    portfolioName,
    totalPortfolioValue,
    unassignedHoldingCount: holdings.filter(
      (holding) => !assignedHoldingIds.has(holding.id),
    ).length,
    strategies,
    databaseReady: true,
  };
}
