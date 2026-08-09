const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODELS = [
  "deepseek/deepseek-chat",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "meta-llama/llama-3.3-70b-instruct",
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
  validate?: (reply: string) => boolean;
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

  const failures: string[] = [];

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
        failures.push(
          `${model}: ${data?.error?.message || `HTTP ${res.status}`}`
        );
        continue;
      }

      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        failures.push(`${model}: tidak ada balasan`);
        continue;
      }

      if (options.validate && !options.validate(reply)) {
        failures.push(`${model}: output tidak memenuhi validasi`);
        continue;
      }

      return reply;
    } catch (err) {
      failures.push(
        `${model}: ${err instanceof Error ? err.message : "error jaringan"}`
      );
      continue;
    }
  }

  throw new Error(
    failures.length > 0
      ? `Semua model gagal: ${failures.join(" | ")}`
      : "Tidak ada model yang dikonfigurasi"
  );
}
