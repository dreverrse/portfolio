const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODELS = [
  "meta-llama/llama-3.3-70b-instruct",
  "deepseek/deepseek-chat",
  "google/gemini-2.0-flash-001",
  "openai/gpt-4o-mini",
];

const MODELS = (
  process.env.OPENROUTER_MODELS || DEFAULT_MODELS.join(",")
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

export type OpenRouterRole = "system" | "user" | "assistant";

export interface OpenRouterMessage {
  role: OpenRouterRole;
  content: string;
}

export interface OpenRouterOptions {
  temperature?: number;
  maxTokens?: number;
}

export async function chatOpenRouter(
  systemPrompt: string,
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server belum dikonfigurasi. Tambahkan OPENROUTER_API_KEY di .env.local"
    );
  }

  let lastError: unknown = new Error("Semua model gagal");

  for (const model of MODELS) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: options.temperature ?? 0.8,
          max_tokens: options.maxTokens ?? 600,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        lastError = new Error(
          data?.error?.message || `OpenRouter error (${res.status})`
        );
        continue;
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        lastError = new Error("Tidak ada balasan dari model");
        continue;
      }

      return reply;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gagal terhubung ke OpenRouter");
}
