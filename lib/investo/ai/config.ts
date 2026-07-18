export const INVESTO_PRIMARY_MODEL =
  process.env.INVESTO_PRIMARY_MODEL?.trim() || "gpt-5.4";

export const INVESTO_DEEP_REVIEW_MODEL =
  process.env.INVESTO_DEEP_REVIEW_MODEL?.trim() || "gpt-5.4-pro";

export const INVESTO_PROMPT_VERSION =
  process.env.INVESTO_PROMPT_VERSION?.trim() || "investo-v1";

export function hasOpenAIConfiguration() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function requireOpenAIConfiguration() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Investo AI requires the server-only OPENAI_API_KEY environment variable.",
    );
  }

  return {
    apiKey,
    primaryModel: INVESTO_PRIMARY_MODEL,
    deepReviewModel: INVESTO_DEEP_REVIEW_MODEL,
    promptVersion: INVESTO_PROMPT_VERSION,
  };
}
