const OPENCODE_ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";

export type OpenCodeZenRole = "system" | "user" | "assistant";

export interface OpenCodeZenMessage {
  role: OpenCodeZenRole;
  content: string;
}

export interface OpenCodeZenOptions {
  temperature?: number;
  maxTokens?: number;
}

export async function chatOpenCodeZen(
  systemPrompt: string,
  messages: OpenCodeZenMessage[],
  options: OpenCodeZenOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server belum dikonfigurasi. Tambahkan OPENCODE_ZEN_API_KEY di .env.local"
    );
  }

  const model = process.env.OPENCODE_ZEN_MODEL || "big-pickle";

  let res: Response;
  try {
    res = await fetch(OPENCODE_ZEN_URL, {
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
  } catch {
    throw new Error("Gagal terhubung ke OpenCode Zen");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Tidak ada balasan dari model");
  }

  return reply;
}
