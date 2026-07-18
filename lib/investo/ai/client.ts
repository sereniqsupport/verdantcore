import "server-only";

import OpenAI from "openai";
import { requireOpenAIConfiguration } from "@/lib/investo/ai/config";

let client: OpenAI | null = null;

export function getInvestoOpenAIClient() {
  const { apiKey } = requireOpenAIConfiguration();

  if (!client) {
    client = new OpenAI({
      apiKey,
    });
  }

  return client;
}
