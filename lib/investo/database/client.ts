import type { SupabaseClient } from "@supabase/supabase-js";
import type { InvestoDatabase } from "@/lib/investo/database/types";

export function asInvestoDatabaseClient(
  client: SupabaseClient,
): SupabaseClient<InvestoDatabase> {
  return client as unknown as SupabaseClient<InvestoDatabase>;
}
