import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { Icon } from "@/components/ui/Icon";
import { BatchRoster, type RosterRow } from "@/components/admin/BatchRoster";
import { BatchClasses, type SessionRow } from "@/components/admin/BatchClasses";
import { BatchStatusControl } from "@/components/admin/BatchStatusControl";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";

interface Batch {
  id: string;
  title: string;
  course_id: string;
  schedule_text: string | null;
  status: string;
  course: { title: string } | null;
  tutor: { full_name: string | null } | null;
}

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: batchData } = await supabase
    .from("batches")
    .select("id,title,course_id,schedule_text,status,course:courses(title),tutor:profiles(full_name)")
    .eq("id", params.id)
    .single();
  const batch = batchData as unknown as Batch | null;
  if (!batch) notFound();

  const [user, { data: enr }, { data: activeEnr }, { data: students }, { data: sess }] = await Promise.all([
    getSessionUser(),
    supabase.from("enrollments").select("id,student_id,student:profiles(full_name,email)").eq("batch_id", params.id),
    // One-batch-per-student: a student may be enrolled in only one ACTIVE batch at
    // a time. We exclude students with any active enrollment (in ANY batch/course).
    // We deliberately do NOT filter on course history — a student whose enrollment
    // is completed reappears for later batches, including the same course (repeaters).
    supabase.from("enrollments").select("student_id").eq("status", "active"),
    supabase.from("profiles").select("id,full_name").eq("role", "student").eq("status", "active").order("full_name"),
    supabase.from("sessions").select("id,title,starts_at,ends_at,join_url,topic,status,actual_start").eq("batch_id", params.id).order("starts_at", { ascending: false }),
  ]);
  const tz = user?.timezone || "UTC";
  const sessions = (sess ?? []) as SessionRow[];

  // Recording status per session (drives the "Mark recording unavailable" action).
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
    student: { full_name: string | null; email: string | null } | null;
  }[]).map((e) => ({
    enrollmentId: e.id,
    studentId: e.student_id,
    fullName: e.student?.full_name ?? null,
    email: e.student?.email ?? null,
  }));

  const activeStudents = new Set((activeEnr ?? []).map((e: { student_id: string }) => e.student_id));
  // Keep students currently enrolled in THIS batch out of the "add" list too.
  const inThisBatch = new Set(roster.map((r) => r.studentId));
  const available = ((students ?? []) as { id: string; full_name: string | null }[]).filter(
    (s) => !activeStudents.has(s.id) && !inThisBatch.has(s.id),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/batches" className="text-xs font-bold text-muted hover:text-gold focus-gold">
            ← Batches
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gold md:text-4xl">{batch.title}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1"><Icon name="menu_book" className="text-sm text-gold" /> {batch.course?.title ?? "—"}</span>
            <span className="flex items-center gap-1"><Icon name="person" className="text-sm text-gold" /> {batch.tutor?.full_name ?? "Unassigned"}</span>
            {batch.schedule_text ? <span className="flex items-center gap-1"><Icon name="schedule" className="text-sm text-gold" /> {batch.schedule_text}</span> : null}
            <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-gold">{batch.status}</span>
          </div>
        </div>
        <BatchStatusControl batchId={batch.id} status={batch.status} />
      </div>

      <CollapsibleSection title="Roster" badge={`${roster.length} ${roster.length === 1 ? "student" : "students"}`}>
        <BatchRoster batchId={batch.id} courseId={batch.course_id} roster={roster} available={available} />
      </CollapsibleSection>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Classes</h2>
        <BatchClasses
          batchId={batch.id}
          roster={roster.map((r) => ({ studentId: r.studentId, fullName: r.fullName }))}
          sessions={sessions}
          tz={tz}
          recStatus={recStatus}
          materials={materials}
        />
      </section>
    </div>
  );
}
