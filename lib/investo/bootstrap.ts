import type { SupabaseClient, User } from "@supabase/supabase-js";

type BootstrapResult = {
  profileReady: boolean;
  portfolioReady: boolean;
  accountsReady: boolean;
  portfolioId: string | null;
  error: string | null;
};

export async function bootstrapInvestoWorkspace(
  supabase: SupabaseClient,
  user: User,
): Promise<BootstrapResult> {
  const profileResult = await supabase
    .from("investo_profiles")
    .upsert(
      {
        user_id: user.id,
        display_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "Investor",
        base_currency: "USD",
        target_annual_return: 0.15,
        maximum_drawdown: 0.25,
        minimum_cash_reserve: 0.1,
        investment_horizon_years: 10,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    );

  if (profileResult.error) {
    return {
      profileReady: false,
      portfolioReady: false,
      accountsReady: false,
      portfolioId: null,
      error: profileResult.error.message,
    };
  }

  const existingPortfolio = await supabase
    .from("investo_portfolios")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (existingPortfolio.error) {
    return {
      profileReady: true,
      portfolioReady: false,
      accountsReady: false,
      portfolioId: null,
      error: existingPortfolio.error.message,
    };
  }

  let portfolioId = existingPortfolio.data?.id ?? null;

  if (!portfolioId) {
    const createdPortfolio = await supabase
      .from("investo_portfolios")
      .insert({
        user_id: user.id,
        name: "Primary Investment Portfolio",
        description:
          "Private long-term capital allocation portfolio managed through Investo.",
        base_currency: "USD",
        benchmark_symbol: "SPY",
        is_primary: true,
        target_cash_weight: 0.1,
      })
      .select("id")
      .single();

    if (createdPortfolio.error || !createdPortfolio.data) {
      return {
        profileReady: true,
        portfolioReady: false,
        accountsReady: false,
        portfolioId: null,
        error:
          createdPortfolio.error?.message ??
          "Primary portfolio could not be created.",
      };
    }

    portfolioId = createdPortfolio.data.id;
  }

  const existingAccounts = await supabase
    .from("investo_accounts")
    .select("name")
    .eq("user_id", user.id)
    .eq("portfolio_id", portfolioId);

  if (existingAccounts.error) {
    return {
      profileReady: true,
      portfolioReady: true,
      accountsReady: false,
      portfolioId,
      error: existingAccounts.error.message,
    };
  }

  const accountNames = new Set(
    (existingAccounts.data ?? []).map((account) => account.name),
  );

  const accountsToCreate = [
    {
      name: "Individual Retirement Account",
      institution_name: "Private Brokerage",
      account_type: "IRA",
      tax_treatment: "tax_deferred",
    },
    {
      name: "Taxable Brokerage",
      institution_name: "Private Brokerage",
      account_type: "Brokerage",
      tax_treatment: "taxable",
    },
  ].filter((account) => !accountNames.has(account.name));

  if (accountsToCreate.length > 0) {
    const insertedAccounts = await supabase
      .from("investo_accounts")
      .insert(
        accountsToCreate.map((account) => ({
          ...account,
          user_id: user.id,
          portfolio_id: portfolioId,
          is_active: true,
        })),
      );

    if (insertedAccounts.error) {
      return {
        profileReady: true,
        portfolioReady: true,
        accountsReady: false,
        portfolioId,
        error: insertedAccounts.error.message,
      };
    }
  }

  return {
    profileReady: true,
    portfolioReady: true,
    accountsReady: true,
    portfolioId,
    error: null,
  };
}
