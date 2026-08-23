import { chatOpenCodeZen, type OpenCodeZenMessage } from "@/lib/opencode-zen";
import { chatOpenRouter } from "@/lib/openrouter";

export interface ChatFallbackOptions {
  temperature?: number;
  maxTokens?: number;
}

function errText(err: unknown): string {
  return err instanceof Error ? err.message : "gagal tidak diketahui";
}

export async function chatWithFallback(
  systemPrompt: string,
  messages: OpenCodeZenMessage[],
  options: ChatFallbackOptions = {}
): Promise<string> {
  const errors: string[] = [];

  try {
    return await chatOpenCodeZen(systemPrompt, messages, options);
  } catch (err) {
    errors.push(`Zen: ${errText(err)}`);
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(errors[0]);
  }

  try {
    return await chatOpenRouter(systemPrompt, messages, options);
  } catch (err) {
    errors.push(`OpenRouter: ${errText(err)}`);
  }

  throw new Error(errors.join(" | "));
}
