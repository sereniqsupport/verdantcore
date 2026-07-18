export const INVESTO_OPENAI_MODEL =
  process.env.INVESTO_OPENAI_MODEL?.trim() || "gpt-5.6-sol";

export const INVESTO_ANTHROPIC_MODEL =
  process.env.INVESTO_ANTHROPIC_MODEL?.trim() || "claude-opus-4-8";

export const INVESTO_PRIMARY_PROVIDER =
  process.env.INVESTO_PRIMARY_PROVIDER?.trim() === "anthropic"
    ? "anthropic"
    : "openai";

export const INVESTO_PROMPT_VERSION =
  process.env.INVESTO_PROMPT_VERSION?.trim() || "investo-dual-review-v1";

export const INVESTO_DUAL_REVIEW_ENABLED =
  process.env.INVESTO_DUAL_REVIEW_ENABLED?.trim().toLowerCase() !== "false";

export function hasOpenAIConfiguration() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function hasAnthropicConfiguration() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function hasCompleteInvestoAIConfiguration() {
  return (
    hasOpenAIConfiguration() &&
    hasAnthropicConfiguration()
  );
}

export function requireOpenAIConfiguration() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Investo requires the server-only OPENAI_API_KEY environment variable.",
    );
  }

  return {
    apiKey,
    model: INVESTO_OPENAI_MODEL,
  };
}

export function requireAnthropicConfiguration() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Investo requires the server-only ANTHROPIC_API_KEY environment variable.",
    );
  }

  return {
    apiKey,
    model: INVESTO_ANTHROPIC_MODEL,
  };
}
