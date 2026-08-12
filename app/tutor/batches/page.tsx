import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";

interface Batch {
  id: string;
  title: string;
  status: string;
  schedule_text: string | null;
  seats_total: number | null;
  course: { title: string } | null;
}

export default async function TutorBatchesPage() {
  const user = await getSessionUser();
  const supabase = createClient();
  const { data } = await supabase
    .from("batches")
    .select("id,title,status,schedule_text,seats_total,course:courses(title)")
    .eq("tutor_id", user?.id ?? "")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Batch[];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">My Batches</h1>
        <p className="mt-1 text-muted">The cohorts you teach. Open one to schedule classes, take attendance and share materials.</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">
          You haven&apos;t been assigned to any batches yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-bold">Batch</th>
                <th className="px-4 py-3 font-bold">Course</th>
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
                  <td className="px-4 py-3 text-muted">{b.schedule_text ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{b.seats_total ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold capitalize text-gold">{b.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/tutor/batches/${b.id}`} className="text-xs font-bold text-gold hover:underline focus-gold">
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
