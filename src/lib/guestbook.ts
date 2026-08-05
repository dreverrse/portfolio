import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";

const MAX_ENTRIES = 200;

export interface GuestEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const memoryStore: GuestEntry[] = [];

export async function getEntries(limit = 100): Promise<GuestEntry[]> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("guestbook_entries")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        createdAt: row.created_at,
      }));
    } catch {
      // fall through ke memory
    }
  }
  return memoryStore.slice(0, limit);
}

export async function addEntry(entry: GuestEntry): Promise<void> {
  if (SUPABASE_ENABLED) {
    try {
      const { error } = await getSupabase().from("guestbook_entries").insert({
        id: entry.id,
        name: entry.name,
        message: entry.message,
        created_at: entry.createdAt,
      });
      if (error) throw error;
      return;
    } catch {
      // fall through ke memory
    }
  }
  memoryStore.unshift(entry);
  memoryStore.length = Math.min(memoryStore.length, MAX_ENTRIES);
}
