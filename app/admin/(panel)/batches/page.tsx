import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { AddBatchButton } from "@/components/admin/AddBatchButton";

interface Batch {
  id: string;
  title: string;
  status: string;
  start_date: string | null;
  schedule_text: string | null;
  seats_total: number | null;
  course: { title: string } | null;
  tutor: { full_name: string | null } | null;
}

export default async function BatchesPage() {
  const supabase = createClient();
  const [{ data: batches }, { data: courses }, { data: tutors }] = await Promise.all([
    supabase
      .from("batches")
      .select("id,title,status,start_date,schedule_text,seats_total,course:courses(title),tutor:profiles(full_name)")
      .order("created_at", { ascending: false }),
    supabase.from("courses").select("id,title").order("title"),
    supabase.from("profiles").select("id,full_name").eq("role", "tutor").eq("status", "active").order("full_name"),
  ]);
  const rows = (batches ?? []) as unknown as Batch[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Batches</h1>
          <p className="mt-1 text-muted">Cohorts of students taught together. Open a batch to manage its roster and classes.</p>
        </div>
        <AddBatchButton
          courses={(courses ?? []) as { id: string; title: string }[]}
          tutors={(tutors ?? []) as { id: string; full_name: string | null }[]}
        />
      </div>

      {courses?.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">
          Create a course first, then you can add batches.
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">No batches yet — create your first cohort.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-bold">Batch</th>
                <th className="px-4 py-3 font-bold">Course</th>
                <th className="px-4 py-3 font-bold">Tutor</th>
                <th className="px-4 py-3 font-bold">Schedule</th>
                <th className="px-4 py-3 font-bold">Seats</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-hairline/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{b.title}</td>
                  <td className="px-4 py-3 text-muted">{b.course?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{b.tutor?.full_name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-muted">{b.schedule_text ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{b.seats_total ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-gold">{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/batches/${b.id}`} className="text-xs font-bold text-gold hover:underline focus-gold">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
