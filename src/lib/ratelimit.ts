import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const UPSTASH_ENABLED = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  if (!redis) {
    redis = new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN });
  }
  return redis;
}

const memoryWindows = new Map<string, { count: number; resetAt: number }>();

function pruneMemory(): void {
  if (memoryWindows.size < 5000) return;
  const now = Date.now();
  for (const [key, state] of memoryWindows) {
    if (now >= state.resetAt) memoryWindows.delete(key);
  }
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function rateLimit(
  identifier: string,
  { limit, windowMs, prefix }: RateLimitOptions
): Promise<RateLimitResult> {
  const client = getRedis();
  if (client) {
    let limiter = limiters.get(prefix);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: client,
        prefix,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      });
      limiters.set(prefix, limiter);
    }
    try {
      const { success, remaining, reset } = await limiter.limit(identifier);
      return { success, limit, remaining, reset };
    } catch {
      // fall through ke memory
    }
  }

  pruneMemory();
  const now = Date.now();
  const key = `${prefix}:${identifier}`;
  const state = memoryWindows.get(key);

  if (!state || now >= state.resetAt) {
    memoryWindows.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (state.count >= limit) {
    return { success: false, limit, remaining: 0, reset: state.resetAt };
  }

  state.count += 1;
  memoryWindows.set(key, state);
  return {
    success: true,
    limit,
    remaining: limit - state.count,
    reset: state.resetAt,
  };
}
