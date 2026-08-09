const ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";
const ZEN_MODEL = process.env.OPENCODE_ZEN_MODEL || "big-pickle";

export interface ZenMessage {
  role: "user" | "assistant";
  content: string;
}

export async function zenChat(messages: ZenMessage[]): Promise<string> {
  const apiKey = process.env.OPENCODE_ZEN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server belum dikonfigurasi. Tambahkan OPENCODE_ZEN_API_KEY di environment."
    );
  }

  const res = await fetch(ZEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
    body: JSON.stringify({
      model: ZEN_MODEL,
      messages,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error?.message || `Zen API error (${res.status})`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Tidak ada balasan dari model");
  }
  return reply;
}
