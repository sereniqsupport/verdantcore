function stripJsonFence(value: string) {
  const trimmed = value.trim();

  if (
    trimmed.startsWith("```json") &&
    trimmed.endsWith("```")
  ) {
    return trimmed
      .slice("```json".length, -3)
      .trim();
  }

  if (
    trimmed.startsWith("```") &&
    trimmed.endsWith("```")
  ) {
    return trimmed
      .slice(3, -3)
      .trim();
  }

  return trimmed;
}

function extractFirstJsonObject(value: string) {
  const normalized = stripJsonFence(value);

  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "The model response did not contain a JSON object.",
    );
  }

  return normalized.slice(start, end + 1);
}

export function parseStructuredJson<T>(
  value: string,
): T {
  const candidate = extractFirstJsonObject(value);

  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown JSON parsing error.";

    throw new Error(
      `The model returned invalid structured output: ${reason}`,
    );
  }
}
