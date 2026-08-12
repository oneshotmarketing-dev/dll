// Minimal single/multi-event .ics builder for "Add to calendar" / "Export
// calendar" (build doc §6/§11 — the reminder path is native calendar alerts).

export interface IcsEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  description?: string;
  location?: string; // e.g. the Zoom join URL — calendars show it as a clickable join link
}

const pad = (n: number) => String(n).padStart(2, "0");
const icsTime = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}${pad(d.getUTCSeconds())}Z`;
const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export function buildIcs(events: IcsEvent[]): string {
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Dees Language Lounge//Portal//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    const start = new Date(e.startsAt);
    const end = e.endsAt ? new Date(e.endsAt) : new Date(start.getTime() + 2 * 3600 * 1000);
    L.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@deeslanguagelounge`,
      `DTSTAMP:${icsTime(new Date())}`,
      `DTSTART:${icsTime(start)}`,
      `DTEND:${icsTime(end)}`,
      `SUMMARY:${esc(e.title)}`,
    );
    if (e.location) L.push(`LOCATION:${esc(e.location)}`);
    if (e.description) L.push(`DESCRIPTION:${esc(e.description)}`);
    L.push("END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

// Client-only: trigger a download of the events as a .ics file.
export function downloadIcs(filename: string, events: IcsEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
