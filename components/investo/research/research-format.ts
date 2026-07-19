export function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function assessmentTone(value: string) {
  switch (value) {
    case "strong":
    case "durable":
    case "disciplined":
    case "ready":
    case "attractive":
    case "material_agreement":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

    case "mixed":
    case "moderate":
    case "partially_ready":
    case "watch":
    case "qualified_agreement":
      return "border-amber-500/30 bg-amber-500/10 text-amber-100";

    case "weak":
    case "fragile":
    case "poor":
    case "not_ready":
    case "avoid":
    case "material_disagreement":
      return "border-red-500/30 bg-red-500/10 text-red-100";

    default:
      return "border-white/15 bg-white/5 text-white/75";
  }
}

export function createEvidenceDraft() {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`,
    title: "",
    source: "",
    sourceUrl: "",
    publishedAt: "",
    dataAsOf: "",
    note: "",
  };
}
