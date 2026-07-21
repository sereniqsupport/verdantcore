"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type RuntimeStatus = "running" | "paused" | "stopped";

function normalizeTicker(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9.-]/g, "")
    .slice(0, 12);
}

export function InvestoTickerResearchEntry({
  runtimeStatus,
}: {
  runtimeStatus: RuntimeStatus;
}) {
  const router = useRouter();
  const [ticker, setTicker] = useState("");

  const normalizedTicker = normalizeTicker(ticker);
  const researchAvailable = runtimeStatus === "running";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedTicker || !researchAvailable) {
      return;
    }

    const parameters = new URLSearchParams({
      ticker: normalizedTicker,
    });

    router.push(`/v2/research?${parameters.toString()}`);
  }

  return (
    <section className="investo-ticker-entry">
      <div className="investo-ticker-entry-copy">
        <p className="investo-eyebrow">Company Research</p>
        <h2>Submit a ticker for investment review.</h2>
        <p>
          Begin a structured review of business quality, financial strength,
          valuation, risks, and the conditions required before action.
        </p>
      </div>

      <form onSubmit={submit}>
        <label htmlFor="investo-command-ticker">Public company ticker</label>

        <div className="investo-ticker-entry-row">
          <input
            autoComplete="off"
            id="investo-command-ticker"
            maxLength={12}
            onChange={(event) => setTicker(normalizeTicker(event.target.value))}
            placeholder="MSFT"
            spellCheck={false}
            value={ticker}
          />

          <button
            disabled={!normalizedTicker || !researchAvailable}
            type="submit"
          >
            Prepare Research
          </button>
        </div>

        <p className="investo-ticker-entry-note">
          {runtimeStatus === "running"
            ? "Investo is ready to prepare new company research."
            : runtimeStatus === "paused"
              ? "Resume AI operations before submitting a ticker."
              : "Start AI operations before submitting a ticker."}
        </p>
      </form>
    </section>
  );
}
