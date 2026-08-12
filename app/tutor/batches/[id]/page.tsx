import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { Icon } from "@/components/ui/Icon";
import { BatchRoster, type RosterRow } from "@/components/admin/BatchRoster";
import { BatchClasses, type SessionRow } from "@/components/admin/BatchClasses";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import { ExportCalendarButton } from "@/components/admin/ExportCalendarButton";

const ATTENDANCE_GRACE_MS = 24 * 3600 * 1000; // 24h tutor edit window

interface Batch {
  id: string;
  title: string;
  course_id: string;
  tutor_id: string | null;
  schedule_text: string | null;
  status: string;
  course: { title: string } | null;
}

export default async function TutorBatchDetailPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const supabase = createClient();
  const { data: batchData } = await supabase
    .from("batches")
    .select("id,title,course_id,tutor_id,schedule_text,status,course:courses(title)")
    .eq("id", params.id)
    .single();
  const batch = batchData as unknown as Batch | null;
  // RLS already limits reads, but guard explicitly: a tutor only sees their batch.
  if (!batch || batch.tutor_id !== user?.id) notFound();

  const [{ data: enr }, { data: sess }] = await Promise.all([
    // Name-only: never pull student email/phone into a tutor's payload.
    supabase.from("enrollments").select("id,student_id,student:profiles(full_name)").eq("batch_id", params.id),
    supabase.from("sessions").select("id,title,starts_at,ends_at,join_url,topic,status,actual_start").eq("batch_id", params.id).order("starts_at"),
  ]);
  const tz = user?.timezone || "UTC";
  const sessions = (sess ?? []) as SessionRow[];

  const { data: recs } = sessions.length
    ? await supabase.from("recordings").select("session_id,status").in("session_id", sessions.map((s) => s.id))
    : { data: [] };
  const recStatus = Object.fromEntries(
    ((recs ?? []) as { session_id: string; status: string }[]).map((r) => [r.session_id, r.status]),
  );

  // Uploaded materials per session (drives the expandable session panel).
  const { data: matData } = sessions.length
    ? await supabase.from("resources").select("id,session_id,title,type").in("session_id", sessions.map((s) => s.id))
    : { data: [] };
  const materials: Record<string, { id: string; title: string; type: string }[]> = {};
  for (const m of (matData ?? []) as { id: string; session_id: string; title: string; type: string }[]) {
    (materials[m.session_id] ??= []).push({ id: m.id, title: m.title, type: m.type });
  }

  const roster: RosterRow[] = ((enr ?? []) as unknown as {
    id: string;
    student_id: string;
    student: { full_name: string | null } | null;
  }[]).map((e) => ({
    enrollmentId: e.id,
    studentId: e.student_id,
    fullName: e.student?.full_name ?? null,
    email: null,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/tutor/batches" className="text-xs font-bold text-muted hover:text-gold focus-gold">
          ← My Batches
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gold md:text-4xl">{batch.title}</h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1"><Icon name="menu_book" className="text-sm text-gold" /> {batch.course?.title ?? "—"}</span>
          {batch.schedule_text ? <span className="flex items-center gap-1"><Icon name="schedule" className="text-sm text-gold" /> {batch.schedule_text}</span> : null}
          <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-gold">{batch.status}</span>
        </div>
      </div>

      <CollapsibleSection title="Roster" badge={`${roster.length} ${roster.length === 1 ? "student" : "students"}`}>
        <BatchRoster batchId={batch.id} courseId={batch.course_id} roster={roster} available={[]} canManage={false} />
      </CollapsibleSection>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">Classes</h2>
          <ExportCalendarButton sessions={sessions} filename={`${batch.title} classes.ics`} />
        </div>
        <p className="text-xs text-muted">
          Generate a full schedule or add sessions one at a time — each gets a Zoom link automatically. You can also take attendance and upload materials &amp; recordings here.
        </p>
        <BatchClasses
          batchId={batch.id}
          roster={roster.map((r) => ({ studentId: r.studentId, fullName: r.fullName }))}
          sessions={sessions}
          tz={tz}
          recStatus={recStatus}
          materials={materials}
          canSchedule={true}
          attendanceGraceMs={ATTENDANCE_GRACE_MS}
        />
      </section>
    </div>
  );
}
