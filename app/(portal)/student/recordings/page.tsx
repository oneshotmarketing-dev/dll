import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { RecordingsView, type RecItem } from "@/components/portal/RecordingsView";
import { computeState } from "@/lib/sessionState";
import { monthLabel, fullDate, timeLabel, durationLabel } from "@/lib/datetime";

interface Sess {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  batch_id: string;
  batch: { title: string } | null;
}

export default async function RecordingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const tz = user.timezone || "UTC";
  const now = Date.now();
  const supabase = createClient();

  const [sessRes, recRes, viewRes] = await Promise.all([
    supabase.from("sessions").select("id,title,starts_at,ends_at,batch_id,batch:batches(title)").neq("status", "cancelled").order("starts_at", { ascending: false }),
    supabase.from("recordings").select("id,session_id,duration,status"),
    supabase.from("recording_views").select("recording_id"),
  ]);

  const sessions = (sessRes.data ?? []) as unknown as Sess[];
  const recMap = new Map(
    (recRes.data ?? []).map((r: { id: string; session_id: string; duration: number | null; status: string }) => [r.session_id, r]),
  );
  const viewed = new Set((viewRes.data ?? []).map((v: { recording_id: string }) => v.recording_id));

  const endMs = (s: Sess) => (s.ends_at ? Date.parse(s.ends_at) : Date.parse(s.starts_at) + 2 * 3600_000);

  // Recordings surface = ended sessions only (never future sessions), newest first.
  const items: RecItem[] = sessions
    .filter((s) => now > endMs(s))
    .map((s) => {
      const rec = recMap.get(s.id);
      const state = computeState(s.starts_at, s.ends_at, (rec?.status as "ready") ?? null, now) as
        | "ready"
        | "processing"
        | "unavailable";
      const recId = rec?.id ?? null;
      return {
        sessionId: s.id,
        recordingId: recId,
        title: s.title,
        monthLabel: monthLabel(s.starts_at, tz),
        dateLabel: fullDate(s.starts_at, tz),
        endTimeLabel: timeLabel(s.ends_at ?? new Date(endMs(s)).toISOString(), tz),
        duration: durationLabel(rec?.duration ?? null),
        batchTitle: s.batch?.title ?? "",
        state,
        isNew: state === "ready" && !!recId && !viewed.has(recId),
      };
    });

  const batchCount = new Set(items.map((i) => i.batchTitle)).size;

  return (
    <RecordingsView
      items={items}
      studentId={user.id}
      batchCount={batchCount}
      subtitle={batchCount === 1 ? items[0]?.batchTitle ?? "" : ""}
    />
  );
}
