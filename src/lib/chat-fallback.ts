import { chatOpenCodeZen, type OpenCodeZenMessage } from "@/lib/opencode-zen";
import { chatOpenRouter } from "@/lib/openrouter";

export interface ChatFallbackOptions {
  temperature?: number;
  maxTokens?: number;
}

function errText(err: unknown): string {
  return err instanceof Error ? err.message : "gagal tidak diketahui";
}

const ZEN_FAILURE_THRESHOLD = 3;
const ZEN_COOLDOWN_MS = 5 * 60 * 1000;

let zenConsecutiveFailures = 0;
let zenLastFailureAt = 0;

function zenShouldSkip(): boolean {
  return (
    zenConsecutiveFailures >= ZEN_FAILURE_THRESHOLD &&
    Date.now() - zenLastFailureAt < ZEN_COOLDOWN_MS
  );
}

export async function chatWithFallback(
  systemPrompt: string,
  messages: OpenCodeZenMessage[],
  options: ChatFallbackOptions = {}
): Promise<string> {
  const errors: string[] = [];

  if (zenShouldSkip()) {
    errors.push("Zen: dilewati sementara karena sering gagal");
  } else {
    try {
      const reply = await chatOpenCodeZen(systemPrompt, messages, options);
      zenConsecutiveFailures = 0;
      return reply;
    } catch (err) {
      zenConsecutiveFailures += 1;
      zenLastFailureAt = Date.now();
      errors.push(`Zen: ${errText(err)}`);
    }
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
