import { kv } from "@vercel/kv";

const KV_ENABLED = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const STORAGE_KEY = "guestbook";
const MAX_ENTRIES = 200;

export interface GuestEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const memoryStore: GuestEntry[] = [];

export async function getEntries(limit = 100): Promise<GuestEntry[]> {
  if (KV_ENABLED) {
    try {
      const data = await kv.get<GuestEntry[]>(STORAGE_KEY);
      return (Array.isArray(data) ? data : []).slice(0, limit);
    } catch {
      return [];
    }
  }
  return memoryStore.slice(0, limit);
}

export async function addEntry(entry: GuestEntry): Promise<void> {
  if (KV_ENABLED) {
    try {
      const current = await kv.get<GuestEntry[]>(STORAGE_KEY);
      const next = [entry, ...(Array.isArray(current) ? current : [])].slice(
        0,
        MAX_ENTRIES
      );
      await kv.set(STORAGE_KEY, next);
      return;
    } catch {
      // fall through ke memory
    }
  }
  memoryStore.unshift(entry);
}
