import {
  pauseInvestoAutomation,
  resumeInvestoAutomation,
  startInvestoAutomation,
  stopInvestoAutomation,
} from "@/app/v2/operations-actions";
import {
  getInvestoRuntimeControl,
  loadInvestoAgentPerformance,
} from "@/lib/investo/operations/control";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InvestoTickerResearchEntry } from "@/components/investo/operations/InvestoTickerResearchEntry";

function formatDuration(value: number | null) {
  if (value === null) {
    return "No completed runs";
  }

  if (value < 1000) {
    return `${value} ms`;
  }

  return `${(value / 1000).toFixed(1)} sec`;
}

function formatTime(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function humanize(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function InvestoOperationsControl({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const [control, performance] = await Promise.all([
    getInvestoRuntimeControl(supabase, userId),
    loadInvestoAgentPerformance(supabase, userId),
  ]);

  const isRunning = control.status === "running";
  const isPaused = control.status === "paused";
  const completedRuns = performance.reduce(
    (total, agent) => total + agent.completedRuns,
    0,
  );
  const failedRuns = performance.reduce(
    (total, agent) => total + agent.failedRuns,
    0,
  );
  const activeAgents = performance.filter(
    (agent) => agent.status === "running",
  ).length;

  return (
    <section className="investo-operations-panel">
      <div className="investo-operations-heading">
        <div>
          <p className="investo-eyebrow">AI Operations Control</p>
          <h2>Control and monitor investment research.</h2>
          <p>
            Start, pause, resume, or stop new AI research work. Every investment
            decision remains under your approval.
          </p>
        </div>

        <div
          className={`investo-runtime-status investo-runtime-status-${control.status}`}
        >
          <span aria-hidden="true" />
          {humanize(control.status)}
        </div>
      </div>

      <div className="investo-control-actions">
        <form action={startInvestoAutomation}>
          <button disabled={isRunning} type="submit">
            Start
          </button>
        </form>

        <form action={pauseInvestoAutomation}>
          <button disabled={!isRunning} type="submit">
            Pause
          </button>
        </form>

        <form action={resumeInvestoAutomation}>
          <button disabled={!isPaused} type="submit">
            Resume
          </button>
        </form>

        <form action={stopInvestoAutomation}>
          <button
            className="investo-control-stop"
            disabled={control.status === "stopped"}
            type="submit"
          >
            Stop
          </button>
        </form>
      </div>

      <p className="investo-control-boundary">
        Pause and Stop prevent new research runs. Work already processing must
        finish before it can be recorded as completed or failed.
      </p>

      <div className="investo-operations-metrics">
        <div>
          <span>Active Agents</span>
          <strong>{activeAgents}</strong>
        </div>

        <div>
          <span>Completed Runs</span>
          <strong>{completedRuns}</strong>
        </div>

        <div>
          <span>Failed Runs</span>
          <strong>{failedRuns}</strong>
        </div>

        <div>
          <span>Last Control Change</span>
          <strong className="investo-small-value">
            {formatTime(control.updatedAt)}
          </strong>
        </div>
      </div>

      <InvestoTickerResearchEntry runtimeStatus={control.status} />

      <div className="investo-agent-fleet">
        <div className="investo-agent-fleet-heading">
          <div>
            <p className="investo-eyebrow">Agent Performance</p>
            <h3>Research workforce status</h3>
          </div>

          <span>{performance.length} agents with recorded activity</span>
        </div>

        {performance.length === 0 ? (
          <div className="investo-agent-empty">
            No agent performance has been recorded yet. Start Investo, then run
            company research to begin building the operating history.
          </div>
        ) : (
          <div className="investo-table-wrap">
            <table className="investo-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Status</th>
                  <th>Current Work</th>
                  <th>Completed</th>
                  <th>Success Rate</th>
                  <th>Average Duration</th>
                  <th>Last Run</th>
                </tr>
              </thead>

              <tbody>
                {performance.map((agent) => (
                  <tr key={agent.agentName}>
                    <td>
                      <strong>{humanize(agent.agentName)}</strong>
                    </td>
                    <td>
                      <span
                        className={`investo-agent-status investo-agent-status-${agent.status}`}
                      >
                        {humanize(agent.status)}
                      </span>
                    </td>
                    <td>{agent.currentSubject ?? "Waiting"}</td>
                    <td>{agent.completedRuns}</td>
                    <td>
                      {agent.successRate === null
                        ? "No history"
                        : `${agent.successRate}%`}
                    </td>
                    <td>{formatDuration(agent.averageDurationMs)}</td>
                    <td>{formatTime(agent.lastRunAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
