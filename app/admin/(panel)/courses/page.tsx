import { createClient } from "@/lib/supabaseServer";
import { AddCourseButton } from "@/components/admin/AddCourseButton";

interface Course {
  id: string;
  title: string;
  level: string | null;
  is_published: boolean;
  language: { name: string } | null;
}

export default async function CoursesPage() {
  const supabase = createClient();
  const [{ data: courses }, { data: languages }] = await Promise.all([
    supabase.from("courses").select("id,title,level,is_published,language:languages(name)").order("created_at", { ascending: false }),
    supabase.from("languages").select("id,name").order("name"),
  ]);
  const rows = (courses ?? []) as unknown as Course[];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Courses</h1>
          <p className="mt-1 text-muted">The programs your batches teach.</p>
        </div>
        <AddCourseButton languages={(languages ?? []) as { id: string; name: string }[]} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">No courses yet — add your first course.</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-bold">Course</th>
                <th className="px-4 py-3 font-bold">Language</th>
                <th className="px-4 py-3 font-bold">Level</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-hairline/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{c.title}</td>
                  <td className="px-4 py-3 text-muted">{c.language?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{c.level ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-pill px-2.5 py-0.5 text-[11px] font-bold" style={{ color: c.is_published ? "#22c55e" : "#8A93A3", backgroundColor: c.is_published ? "#22c55e1a" : "#8A93A31a" }}>
                      {c.is_published ? "Published" : "Draft"}
                    </span>
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
