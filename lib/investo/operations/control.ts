import type { SupabaseClient } from "@supabase/supabase-js";

export type InvestoRuntimeStatus = "running" | "paused" | "stopped";

export type InvestoRuntimeControl = {
  status: InvestoRuntimeStatus;
  lastStartedAt: string | null;
  lastPausedAt: string | null;
  lastStoppedAt: string | null;
  updatedAt: string | null;
};

export type InvestoAgentPerformance = {
  agentName: string;
  status: "running" | "healthy" | "attention" | "idle";
  completedRuns: number;
  failedRuns: number;
  successRate: number | null;
  averageDurationMs: number | null;
  lastRunAt: string | null;
  currentSubject: string | null;
};

type RuntimeControlRow = {
  status: InvestoRuntimeStatus;
  last_started_at: string | null;
  last_paused_at: string | null;
  last_stopped_at: string | null;
  updated_at: string | null;
};

type AgentActivityRow = {
  agent_name: string;
  subject: string | null;
  status: "running" | "completed" | "failed" | "blocked";
  duration_ms: number | null;
  started_at: string;
  completed_at: string | null;
};

const RUNTIME_NAME = "investment-research";

function operationsClient(supabase: SupabaseClient) {
  return supabase as unknown as {
    from: (table: string) => any;
  };
}

export async function getInvestoRuntimeControl(
  supabase: SupabaseClient,
  userId: string,
): Promise<InvestoRuntimeControl> {
  const { data, error } = await operationsClient(supabase)
    .from("investo_runtime_controls")
    .select(
      "status, last_started_at, last_paused_at, last_stopped_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("runtime_name", RUNTIME_NAME)
    .maybeSingle<RuntimeControlRow>();

  if (error) {
    return {
      status: "stopped",
      lastStartedAt: null,
      lastPausedAt: null,
      lastStoppedAt: null,
      updatedAt: null,
    };
  }

  return {
    status: data?.status ?? "stopped",
    lastStartedAt: data?.last_started_at ?? null,
    lastPausedAt: data?.last_paused_at ?? null,
    lastStoppedAt: data?.last_stopped_at ?? null,
    updatedAt: data?.updated_at ?? null,
  };
}

export async function setInvestoRuntimeControl(
  supabase: SupabaseClient,
  userId: string,
  status: InvestoRuntimeStatus,
) {
  const now = new Date().toISOString();

  const timestampFields =
    status === "running"
      ? { last_started_at: now }
      : status === "paused"
        ? { last_paused_at: now }
        : { last_stopped_at: now };

  const { error } = await operationsClient(supabase)
    .from("investo_runtime_controls")
    .upsert(
      {
        user_id: userId,
        runtime_name: RUNTIME_NAME,
        status,
        updated_at: now,
        ...timestampFields,
      },
      {
        onConflict: "user_id,runtime_name",
      },
    );

  if (error) {
    throw new Error(`Unable to update Investo operations: ${error.message}`);
  }
}

export async function beginInvestoOperationsActivity({
  supabase,
  userId,
  agentName,
  subject,
}: {
  supabase: SupabaseClient;
  userId: string;
  agentName: string;
  subject?: string | null;
}) {
  const { data, error } = await operationsClient(supabase)
    .from("investo_agent_activity")
    .insert({
      user_id: userId,
      agent_name: agentName,
      run_type: "company-research",
      subject: subject ?? null,
      status: "running",
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    console.error("Investo activity start could not be recorded:", error);
    return null;
  }

  return data.id;
}

export async function completeInvestoOperationsActivity({
  supabase,
  activityId,
  startedAt,
}: {
  supabase: SupabaseClient;
  activityId: string | null;
  startedAt: number;
}) {
  if (!activityId) {
    return;
  }

  const completedAt = new Date().toISOString();

  const { error } = await operationsClient(supabase)
    .from("investo_agent_activity")
    .update({
      status: "completed",
      completed_at: completedAt,
      duration_ms: Math.max(0, Date.now() - startedAt),
    })
    .eq("id", activityId);

  if (error) {
    console.error("Investo activity completion could not be recorded:", error);
  }
}

export async function failInvestoOperationsActivity({
  supabase,
  activityId,
  startedAt,
  errorMessage,
}: {
  supabase: SupabaseClient;
  activityId: string | null;
  startedAt: number;
  errorMessage: string;
}) {
  if (!activityId) {
    return;
  }

  const { error } = await operationsClient(supabase)
    .from("investo_agent_activity")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      duration_ms: Math.max(0, Date.now() - startedAt),
      error_message: errorMessage.slice(0, 500),
    })
    .eq("id", activityId);

  if (error) {
    console.error("Investo activity failure could not be recorded:", error);
  }
}

export async function loadInvestoAgentPerformance(
  supabase: SupabaseClient,
  userId: string,
): Promise<InvestoAgentPerformance[]> {
  const { data, error } = await operationsClient(supabase)
    .from("investo_agent_activity")
    .select(
      "agent_name, subject, status, duration_ms, started_at, completed_at",
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(250)
    .returns<AgentActivityRow[]>();

  if (error || !data) {
    return [];
  }

  const grouped = new Map<string, AgentActivityRow[]>();

  for (const row of data) {
    const existing = grouped.get(row.agent_name) ?? [];
    existing.push(row);
    grouped.set(row.agent_name, existing);
  }

  return Array.from(grouped.entries()).map(([agentName, rows]) => {
    const completed = rows.filter((row) => row.status === "completed");
    const failed = rows.filter((row) => row.status === "failed");
    const finished = [...completed, ...failed];
    const durations = finished
      .map((row) => row.duration_ms)
      .filter((value): value is number => typeof value === "number");

    const latest = rows[0];
    const running = rows.find((row) => row.status === "running");

    return {
      agentName,
      status: running
        ? "running"
        : failed.length > 0 && latest.status === "failed"
          ? "attention"
          : finished.length > 0
            ? "healthy"
            : "idle",
      completedRuns: completed.length,
      failedRuns: failed.length,
      successRate:
        finished.length > 0
          ? Math.round((completed.length / finished.length) * 1000) / 10
          : null,
      averageDurationMs:
        durations.length > 0
          ? Math.round(
              durations.reduce((total, value) => total + value, 0) /
                durations.length,
            )
          : null,
      lastRunAt: latest?.completed_at ?? latest?.started_at ?? null,
      currentSubject: running?.subject ?? null,
    };
  });
}
