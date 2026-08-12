// All portal times are stored in UTC and rendered through the student's
// timezone (build doc §9 golden rule). These helpers format in a given IANA tz.

export function partOfDay(tz: string, now: Date = new Date()): "morning" | "afternoon" | "evening" {
  const h = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(now),
  );
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export function dateBadge(iso: string, tz: string): { month: string; day: string } {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "2-digit" })
    .formatToParts(new Date(iso));
  return {
    month: (p.find((x) => x.type === "month")?.value ?? "").toUpperCase(),
    day: p.find((x) => x.type === "day")?.value ?? "",
  };
}

export function weekday(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "long" })
    .format(new Date(iso))
    .toUpperCase();
}

export function timeLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function dateTimeLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

// "Today" / "Tomorrow" / "in 3 days" — based on the calendar day in the tz.
export function relativeDay(iso: string, tz: string, now: Date = new Date()): string {
  const dayKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const target = new Date(iso);
  const a = dayKey(now);
  const b = dayKey(target);
  if (a === b) return "Today";
  const diffDays = Math.round(
    (Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000,
  );
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `in ${diffDays} days`;
  if (diffDays === -1) return "Yesterday";
  return `${Math.abs(diffDays)} days ago`;
}

export function monthLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "long", year: "numeric" })
    .format(new Date(iso))
    .toUpperCase();
}

export function fullDate(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "long", day: "numeric", year: "numeric" }).format(
    new Date(iso),
  );
}

export function durationLabel(minutes: number | null | undefined): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m ? `${m}m` : ""}`.trim() : `${m}m`;
}

// ─── Wall-clock ⇄ UTC in a specific IANA timezone ──────────────────────────
// Admins enter a date + time meaning "this wall-clock time in MY timezone".
// We must convert that to the correct UTC instant (DST-aware), not the browser's
// local zone. Uses the standard offset-probe technique — no external library.

// The tz's UTC offset (ms) at a given instant.
function tzOffsetMs(instant: number, tz: string): number {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(new Date(instant));
  const m: Record<string, string> = {};
  for (const x of p) m[x.type] = x.value;
  const asUtc = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour % 24, +m.minute, +m.second);
  return asUtc - instant;
}

// Interpret "YYYY-MM-DD" + "HH:mm" as a wall-clock time in `tz` → UTC Date.
export function zonedToUtc(dateStr: string, timeStr: string, tz: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  // First offset probe, then re-probe at the corrected instant to handle the
  // rare DST-boundary case where the offset differs across the guess.
  let offset = tzOffsetMs(guess, tz);
  offset = tzOffsetMs(guess - offset, tz);
  return new Date(guess - offset);
}

// UTC ISO → the "YYYY-MM-DD" / "HH:mm" wall-clock strings as seen in `tz`
// (for prefilling <input type=date|time> in the admin's own timezone).
export function utcToZonedParts(iso: string, tz: string): { date: string; time: string } {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso));
  const m: Record<string, string> = {};
  for (const x of p) m[x.type] = x.value;
  const hh = m.hour === "24" ? "00" : m.hour;
  return { date: `${m.year}-${m.month}-${m.day}`, time: `${hh}:${m.minute}` };
}

// Weekday (0=Sun..6=Sat) of a calendar date string — tz-independent.
export function weekdayOfDate(dateStr: string): number {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay();
}

// Add N days to a "YYYY-MM-DD" string (anchored at noon UTC to dodge DST edges).
export function addDaysStr(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Short tz abbreviation now (e.g. "EST", "IST").
export function tzAbbr(tz: string, now: Date = new Date()): string {
  try {
    return (
      new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

// Human label for a picker option, e.g. "Toronto (EDT)".
export function tzOptionLabel(tz: string): string {
  const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
  const abbr = tzAbbr(tz);
  return abbr ? `${city} (${abbr})` : city;
}
