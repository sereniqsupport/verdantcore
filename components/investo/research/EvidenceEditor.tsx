"use client";

import type {
  EvidenceDraft,
} from "@/components/investo/research/types";
import {
  createEvidenceDraft,
} from "@/components/investo/research/research-format";

type EvidenceEditorProps = {
  evidence: EvidenceDraft[];
  onChange: (evidence: EvidenceDraft[]) => void;
  disabled?: boolean;
};

function updateEvidence(
  evidence: EvidenceDraft[],
  id: string,
  field: keyof Omit<EvidenceDraft, "id">,
  value: string,
) {
  return evidence.map((item) =>
    item.id === id
      ? {
          ...item,
          [field]: value,
        }
      : item,
  );
}

export function EvidenceEditor({
  evidence,
  onChange,
  disabled = false,
}: EvidenceEditorProps) {
  return (
    <div className="space-y-4">
      {evidence.map((item, index) => (
        <section
          key={item.id}
          className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-medium text-white">
              Evidence {index + 1}
            </h3>

            {evidence.length > 1 ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  onChange(
                    evidence.filter(
                      (candidate) =>
                        candidate.id !== item.id,
                    ),
                  )
                }
                className="text-xs text-white/40 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">
                Evidence title *
              </span>

              <input
                required
                disabled={disabled}
                value={item.title}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "title",
                      event.target.value,
                    ),
                  )
                }
                placeholder="Annual report, earnings release, investor presentation"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">
                Source
              </span>

              <input
                disabled={disabled}
                value={item.source}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "source",
                      event.target.value,
                    ),
                  )
                }
                placeholder="Company filing, SEC, earnings call"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-white/55">
                Source URL
              </span>

              <input
                disabled={disabled}
                type="url"
                value={item.sourceUrl}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "sourceUrl",
                      event.target.value,
                    ),
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">
                Published date
              </span>

              <input
                disabled={disabled}
                type="date"
                value={item.publishedAt}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "publishedAt",
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium text-white/55">
                Data current through
              </span>

              <input
                disabled={disabled}
                type="date"
                value={item.dataAsOf}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "dataAsOf",
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:opacity-50"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs font-medium text-white/55">
                Verified facts and relevant excerpts
              </span>

              <textarea
                disabled={disabled}
                rows={7}
                value={item.note}
                onChange={(event) =>
                  onChange(
                    updateEvidence(
                      evidence,
                      item.id,
                      "note",
                      event.target.value,
                    ),
                  )
                }
                placeholder="Paste verified financial figures, management statements, operating metrics, risks, or relevant excerpts."
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
              />
            </label>
          </div>
        </section>
      ))}

      <button
        type="button"
        disabled={disabled || evidence.length >= 30}
        onClick={() =>
          onChange([
            ...evidence,
            createEvidenceDraft(),
          ])
        }
        className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add evidence
      </button>
    </div>
  );
}
