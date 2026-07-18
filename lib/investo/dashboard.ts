import type { SupabaseClient } from "@supabase/supabase-js";

export type InvestoDashboardData = {
  portfolioId: string | null;
  portfolioName: string;
  portfolioValue: number;
  availableCapital: number;
  holdingsCount: number;
  preparedDecisions: number;
  openAlerts: number;
  watchlistCount: number;
  databaseReady: boolean;
  databaseError: string | null;
};

export async function loadInvestoDashboard(
  supabase: SupabaseClient,
  userId: string,
): Promise<InvestoDashboardData> {
  const portfolio = await supabase
    .from("investo_portfolios")
    .select("id, name")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (portfolio.error) {
    return {
      portfolioId: null,
      portfolioName: "Primary Investment Portfolio",
      portfolioValue: 0,
      availableCapital: 0,
      holdingsCount: 0,
      preparedDecisions: 0,
      openAlerts: 0,
      watchlistCount: 0,
      databaseReady: false,
      databaseError: portfolio.error.message,
    };
  }

  const portfolioId = portfolio.data?.id ?? null;

  if (!portfolioId) {
    return {
      portfolioId: null,
      portfolioName: "Primary Investment Portfolio",
      portfolioValue: 0,
      availableCapital: 0,
      holdingsCount: 0,
      preparedDecisions: 0,
      openAlerts: 0,
      watchlistCount: 0,
      databaseReady: true,
      databaseError: null,
    };
  }

  const [
    holdingsResult,
    decisionsResult,
    alertsResult,
    watchlistResult,
  ] = await Promise.all([
    supabase
      .from("investo_holdings")
      .select("market_value, asset_class", {
        count: "exact",
      })
      .eq("user_id", userId)
      .eq("portfolio_id", portfolioId),

    supabase
      .from("investo_decisions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("status", "prepared"),

    supabase
      .from("investo_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId)
      .eq("is_resolved", false),

    supabase
      .from("investo_watchlist")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", userId),
  ]);

  const firstError =
    holdingsResult.error ??
    decisionsResult.error ??
    alertsResult.error ??
    watchlistResult.error;

  if (firstError) {
    return {
      portfolioId,
      portfolioName: portfolio.data?.name ?? "Primary Investment Portfolio",
      portfolioValue: 0,
      availableCapital: 0,
      holdingsCount: 0,
      preparedDecisions: 0,
      openAlerts: 0,
      watchlistCount: 0,
      databaseReady: false,
      databaseError: firstError.message,
    };
  }

  const holdings = holdingsResult.data ?? [];

  const portfolioValue = holdings.reduce(
    (total, holding) => total + Number(holding.market_value ?? 0),
    0,
  );

  const availableCapital = holdings
    .filter((holding) =>
      ["cash", "treasury"].includes(String(holding.asset_class)),
    )
    .reduce(
      (total, holding) => total + Number(holding.market_value ?? 0),
      0,
    );

  return {
    portfolioId,
    portfolioName: portfolio.data?.name ?? "Primary Investment Portfolio",
    portfolioValue,
    availableCapital,
    holdingsCount: holdingsResult.count ?? holdings.length,
    preparedDecisions: decisionsResult.count ?? 0,
    openAlerts: alertsResult.count ?? 0,
    watchlistCount: watchlistResult.count ?? 0,
    databaseReady: true,
    databaseError: null,
  };
}
