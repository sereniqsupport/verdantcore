"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInvestoUser } from "@/lib/investo/auth";
import { bootstrapInvestoWorkspace } from "@/lib/investo/bootstrap";

export async function initializeInvestoWorkspace() {
  const { supabase, user } = await requireInvestoUser();

  const result = await bootstrapInvestoWorkspace(supabase, user);

  if (result.error) {
    redirect(
      `/v2?setup_error=${encodeURIComponent(result.error)}`,
    );
  }

  revalidatePath("/v2");
  revalidatePath("/v2/portfolio");

  redirect("/v2?setup=complete");
}
