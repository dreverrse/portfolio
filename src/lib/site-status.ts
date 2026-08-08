import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";

const TIMEOUT_MS = 8000;

export interface IntegrationStatus {
  name: string;
  status: "up" | "down" | "disabled";
  latencyMs: number;
  error?: string;
}

async function ping(
  url: string,
  headers?: Record<string, string>
): Promise<number> {
  const start = Date.now();
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Date.now() - start;
}

async function githubCheck(): Promise<IntegrationStatus> {
  try {
    const latency = await ping("https://api.github.com/rate_limit");
    return { name: "GitHub", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "GitHub",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function lastfmCheck(): Promise<IntegrationStatus> {
  if (!process.env.LASTFM_API_KEY || !process.env.LASTFM_USERNAME) {
    return { name: "Last.fm", status: "disabled", latencyMs: 0 };
  }
  try {
    const params = new URLSearchParams({
      method: "user.getinfo",
      user: process.env.LASTFM_USERNAME,
      api_key: process.env.LASTFM_API_KEY,
      format: "json",
    });
    const latency = await ping(`https://ws.audioscrobbler.com/2.0/?${params}`);
    return { name: "Last.fm", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "Last.fm",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function openRouterCheck(): Promise<IntegrationStatus> {
  if (!process.env.OPENROUTER_API_KEY) {
    return { name: "OpenRouter", status: "disabled", latencyMs: 0 };
  }
  try {
    const latency = await ping("https://openrouter.ai/api/v1/models", {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    });
    return { name: "OpenRouter", status: "up", latencyMs: latency };
  } catch (err) {
    return {
      name: "OpenRouter",
      status: "down",
      latencyMs: 0,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

async function supabaseCheck(): Promise<IntegrationStatus> {
  if (!SUPABASE_ENABLED) {
    return { name: "Supabase", status: "disabled", latencyMs: 0 };
  }
  const start = Date.now();
  try {
    const { error } = await getSupabase()
      .from("admin_posts")
      .select("slug", { count: "exact", head: true });
    if (error) throw error;
    return { name: "Supabase", status: "up", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      name: "Supabase",
      status: "down",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Gagal",
    };
  }
}

export async function checkSiteStatus(): Promise<IntegrationStatus[]> {
  const results = await Promise.allSettled([
    githubCheck(),
    lastfmCheck(),
    openRouterCheck(),
    supabaseCheck(),
  ]);
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : {
          name: "Unknown",
          status: "down" as const,
          latencyMs: 0,
          error: r.reason instanceof Error ? r.reason.message : "Gagal",
        }
  );
}
