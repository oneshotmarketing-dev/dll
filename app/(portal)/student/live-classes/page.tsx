import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { LiveClassesView, type ClassRow, type BatchProgress } from "@/components/portal/LiveClassesView";
import { dateBadge, weekday, timeLabel, durationLabel, dateTimeLabel } from "@/lib/datetime";

interface Sess {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  join_url: string | null;
  topic: string | null;
  batch_id: string;
  batch: { title: string; tutor: { full_name: string | null } | null } | null;
}

export default async function LiveClassesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const tz = user.timezone || "UTC";
  const now = Date.now();
  const supabase = createClient();

  const [sessRes, attRes, recRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("id,title,starts_at,ends_at,join_url,topic,batch_id,batch:batches(title,tutor:profiles(full_name))")
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true }),
    supabase.from("attendance").select("session_id,status"),
    supabase.from("recordings").select("session_id,status"),
  ]);

  const sessions = (sessRes.data ?? []) as unknown as Sess[];
  const attMap = new Map((attRes.data ?? []).map((a: { session_id: string; status: string }) => [a.session_id, a.status]));
  const recMap = new Map((recRes.data ?? []).map((r: { session_id: string; status: string }) => [r.session_id, r.status]));

  // Per-batch progress
  const byBatch = new Map<string, BatchProgress>();
  for (const s of sessions) {
    const b = byBatch.get(s.batch_id) ?? {
      title: s.batch?.title ?? "Batch",
      trainer: s.batch?.tutor?.full_name ?? null,
      total: 0,
      ended: 0,
    };
    b.total++;
    const end = s.ends_at ? Date.parse(s.ends_at) : Date.parse(s.starts_at) + 2 * 3600_000;
    if (now > end) b.ended++;
    byBatch.set(s.batch_id, b);
  }
  const batches = [...byBatch.values()];

  const rows: ClassRow[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    joinUrl: s.join_url,
    topic: s.topic,
    trainer: s.batch?.tutor?.full_name ?? null,
    batchTitle: s.batch?.title ?? "",
    badge: dateBadge(s.starts_at, tz),
    weekday: weekday(s.starts_at, tz),
    time: timeLabel(s.starts_at, tz),
    duration: durationLabel(
      s.ends_at ? Math.round((Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 60000) : null,
    ),
    dateTime: dateTimeLabel(s.starts_at, tz),
    attendance: (attMap.get(s.id) as string) ?? null,
    recordingStatus: (recMap.get(s.id) as string) ?? null,
  }));

  return (
    <LiveClassesView
      batches={batches}
      rows={rows}
      tz={tz}
      serverNow={now}
      subtitle={batches.map((b) => b.title).join(" · ")}
    />
  );
}
