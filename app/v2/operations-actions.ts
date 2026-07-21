"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  setInvestoRuntimeControl,
  type InvestoRuntimeStatus,
} from "@/lib/investo/operations/control";

async function updateRuntime(status: InvestoRuntimeStatus) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }

  await setInvestoRuntimeControl(supabase, user.id, status);

  revalidatePath("/v2");
  revalidatePath("/v2/research");
}

export async function startInvestoAutomation() {
  await updateRuntime("running");
}

export async function pauseInvestoAutomation() {
  await updateRuntime("paused");
}

export async function resumeInvestoAutomation() {
  await updateRuntime("running");
}

export async function stopInvestoAutomation() {
  await updateRuntime("stopped");
}
