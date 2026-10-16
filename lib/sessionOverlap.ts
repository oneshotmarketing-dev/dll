import type { SupabaseClient } from "@supabase/supabase-js";

// Every class is a Zoom meeting under the one shared host account, which can only
// host one meeting at a time — so no two active sessions may overlap, in any batch.
// Sessions without an end time count as 2 hours (same default as computeState).

const DEFAULT_MS = 2 * 3600_000;
const MAX_LOOKBACK_MS = 24 * 3600_000; // longest class we expect; bounds the query

export interface Slot {
  starts_at: string;
  ends_at: string | null;
}

export interface OverlapConflict {
  title: string;
  batch: string | null;
  starts_at: string;
}

const range = (s: Slot): [number, number] => {
  const start = Date.parse(s.starts_at);
  return [start, s.ends_at ? Date.parse(s.ends_at) : start + DEFAULT_MS];
};
const overlaps = (a: Slot, b: Slot) => {
  const [as, ae] = range(a);
  const [bs, be] = range(b);
  return as < be && bs < ae;
};

/**
 * Returns the first existing (non-cancelled) session — or other slot in the same
 * request — that overlaps any of `slots`, or null if they're all free.
 * `excludeId` skips the session being rescheduled/restored itself.
 */
export async function findOverlap(
  svc: SupabaseClient,
  slots: (Slot & { title?: string })[],
  excludeId?: string,
): Promise<OverlapConflict | null> {
  if (!slots.length) return null;

  // Overlaps within the request itself (e.g. a generated schedule).
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (overlaps(slots[i], slots[j])) {
        return { title: slots[j].title ?? "another new session", batch: null, starts_at: slots[j].starts_at };
      }
    }
  }

  const minStart = Math.min(...slots.map((s) => range(s)[0]));
  const maxEnd = Math.max(...slots.map((s) => range(s)[1]));
  let query = svc
    .from("sessions")
    .select("id,title,starts_at,ends_at,batch:batches(title)")
    .neq("status", "cancelled")
    .gte("starts_at", new Date(minStart - MAX_LOOKBACK_MS).toISOString())
    .lt("starts_at", new Date(maxEnd).toISOString());
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;

  const existing = (data ?? []) as unknown as (Slot & { title: string; batch: { title: string } | null })[];
  for (const slot of slots) {
    const hit = existing.find((e) => overlaps(slot, e));
    if (hit) return { title: hit.title, batch: hit.batch?.title ?? null, starts_at: hit.starts_at };
  }
  return null;
}
