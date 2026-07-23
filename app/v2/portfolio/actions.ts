"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function requiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required.`);
  }

  return value.trim();
}

function optionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function positiveNumber(formData: FormData, name: string) {
  const rawValue = requiredString(formData, name);
  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be greater than zero.`);
  }

  return value;
}

async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/v2/login?next=%2Fv2%2Fportfolio");
  }

  return {
    supabase,
    user,
  };
}

async function getPrimaryPortfolio(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  const result = await supabase
    .from("investo_portfolios")
    .select("id")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Primary portfolio was not found.");
  }

  return result.data.id;
}

export async function addPortfolioHolding(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  const portfolioId = await getPrimaryPortfolio(supabase, user.id);
  const accountId = requiredString(formData, "account_id");

  const account = await supabase
    .from("investo_accounts")
    .select("id")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .eq("portfolio_id", portfolioId)
    .maybeSingle();

  if (account.error) {
    throw new Error(account.error.message);
  }

  if (!account.data) {
    throw new Error("The selected investment account is not available.");
  }

  const symbol = requiredString(formData, "symbol").toUpperCase();
  const assetName = optionalString(formData, "asset_name");
  const assetClass =
    optionalString(formData, "asset_class") ?? "equity";
  const conviction =
    optionalString(formData, "conviction") ?? "Not rated";

  const quantity = positiveNumber(formData, "quantity");
  const averageCost = positiveNumber(formData, "average_cost");
  const currentPrice = positiveNumber(formData, "current_price");
  const marketValue = quantity * currentPrice;

  if (!/^[A-Z0-9.-]{1,15}$/.test(symbol)) {
    throw new Error("Enter a valid public-market symbol.");
  }

  const result = await supabase.from("investo_holdings").insert({
    user_id: user.id,
    portfolio_id: portfolioId,
    account_id: accountId,
    symbol,
    asset_name: assetName,
    asset_class: assetClass,
    quantity,
    average_cost: averageCost,
    current_price: currentPrice,
    market_value: marketValue,
    conviction,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/portfolio");
}

export async function updatePortfolioHolding(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  const portfolioId = await getPrimaryPortfolio(supabase, user.id);
  const holdingId = requiredString(formData, "holding_id");

  const quantity = positiveNumber(formData, "quantity");
  const averageCost = positiveNumber(formData, "average_cost");
  const currentPrice = positiveNumber(formData, "current_price");
  const conviction =
    optionalString(formData, "conviction") ?? "Not rated";

  const result = await supabase
    .from("investo_holdings")
    .update({
      quantity,
      average_cost: averageCost,
      current_price: currentPrice,
      market_value: quantity * currentPrice,
      conviction,
    })
    .eq("id", holdingId)
    .eq("user_id", user.id)
    .eq("portfolio_id", portfolioId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/portfolio");
}

export async function removePortfolioHolding(formData: FormData) {
  const { supabase, user } = await requireAuthenticatedUser();

  const portfolioId = await getPrimaryPortfolio(supabase, user.id);
  const holdingId = requiredString(formData, "holding_id");

  const result = await supabase
    .from("investo_holdings")
    .delete()
    .eq("id", holdingId)
    .eq("user_id", user.id)
    .eq("portfolio_id", portfolioId);

  if (result.error) {
    throw new Error(result.error.message);
  }

  revalidatePath("/v2");
  revalidatePath("/v2/portfolio");
}
