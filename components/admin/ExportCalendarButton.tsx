"use client";

import { Icon } from "@/components/ui/Icon";
import { downloadIcs, type IcsEvent } from "@/lib/ics";

interface Sess {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  join_url: string | null;
}

// Downloads the batch's upcoming (not-ended, not-cancelled) classes as a .ics
// file so the tutor can import the whole schedule into their calendar. Mirrors
// the student Live Classes "Export calendar".
export function ExportCalendarButton({ sessions, filename = "classes.ics" }: { sessions: Sess[]; filename?: string }) {
  const now = Date.now();
  const events: IcsEvent[] = sessions
    .filter((s) => {
      if (s.status === "cancelled") return false;
      const end = s.ends_at ? Date.parse(s.ends_at) : Date.parse(s.starts_at) + 2 * 3600_000;
      return end >= now; // upcoming/ongoing only — past classes aren't useful in a calendar
    })
    .map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      location: s.join_url ?? undefined,
      description: s.join_url ? `Join the Zoom class: ${s.join_url}` : undefined,
    }));

  return (
    <button
      type="button"
      onClick={() => downloadIcs(filename, events)}
      disabled={events.length === 0}
      title={events.length === 0 ? "No upcoming classes to export" : undefined}
      className="flex shrink-0 items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-gold hover:underline focus-gold disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
    >
      <Icon name="download" className="text-sm" /> Export calendar
    </button>
  );
}
