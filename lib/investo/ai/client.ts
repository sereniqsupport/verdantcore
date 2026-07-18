import "server-only";

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import {
  requireAnthropicConfiguration,
  requireOpenAIConfiguration,
} from "@/lib/investo/ai/config";

let openAIClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

export function getInvestoOpenAIClient() {
  const { apiKey } = requireOpenAIConfiguration();

  if (!openAIClient) {
    openAIClient = new OpenAI({
      apiKey,
    });
  }

  return openAIClient;
}

export function getInvestoAnthropicClient() {
  const { apiKey } = requireAnthropicConfiguration();

  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey,
    });
  }

  return anthropicClient;
}
