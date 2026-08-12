// The single source of truth for a session's computed state (build doc §1).
// Derived from starts_at/ends_at + the recording's sync status — never a stored
// flag. Shared by the dashboard hero, live classes, and recordings surfaces.

export type SessionState = "upcoming" | "joinable" | "live" | "processing" | "ready" | "unavailable";

export const JOIN_WINDOW_MS = 15 * 60 * 1000; // gold Join opens 15 min before start
const H48_MS = 48 * 3600 * 1000;

export function computeState(
  startsAt: string,
  endsAt: string | null,
  recordingStatus: "processing" | "ready" | "unavailable" | null,
  now: number = Date.now(),
  // When the class was actually started (the teacher/admin "Start class now"
  // action). If set and we're not past the end, the class is LIVE even before
  // the scheduled starts_at — the displayed time stays the scheduled one.
  actualStart?: string | null,
): SessionState {
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + 2 * 3600 * 1000;
  const started = actualStart ? new Date(actualStart).getTime() : null;
  // Live if it actually started and we're still within the class window.
  if (started !== null && now >= started && now <= end) return "live";
  // Ended — checked before the pre-start states so a class ended early (ends_at
  // truncated to before the scheduled start) still reads as ended, not joinable.
  if (now > end) {
    if (recordingStatus === "ready") return "ready";
    if (recordingStatus === "unavailable") return "unavailable";
    if (now - end > H48_MS) return "unavailable";
    return "processing";
  }
  if (now < start - JOIN_WINDOW_MS) return "upcoming";
  if (now < start) return "joinable";
  return "live";
}

export const isJoinable = (s: SessionState) => s === "joinable" || s === "live";
export const hasEnded = (s: SessionState) =>
  s === "processing" || s === "ready" || s === "unavailable";
