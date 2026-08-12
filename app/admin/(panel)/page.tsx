import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { Icon } from "@/components/ui/Icon";
import { computeState } from "@/lib/sessionState";

interface TodaySess {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: string;
  batch: { title: string | null } | null;
}

const STATE_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  joinable: "Joining",
  live: "Live",
  processing: "Ended",
  ready: "Ended",
  unavailable: "Ended",
};

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  const tz = user?.timezone || "UTC";
  const now = Date.now();

  // Window wide enough to cover "today" in any tz; filtered to today below.
  const dayStart = new Date(now - 36 * 3600_000).toISOString();
  const dayEnd = new Date(now + 36 * 3600_000).toISOString();

  const [students, tutors, courses, batches, enrolments, { data: sessData }, { data: recData }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("batches").select("*", { count: "exact", head: true }).in("status", ["open", "running"]),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("sessions")
      .select("id,title,starts_at,ends_at,status,batch:batches(title)")
      .neq("status", "cancelled")
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd)
      .order("starts_at", { ascending: true }),
    supabase.from("recordings").select("session_id,status"),
  ]);

  const kpis = [
    { label: "Students", value: students.count ?? 0, icon: "school", href: "/admin/students" },
    { label: "Tutors", value: tutors.count ?? 0, icon: "co_present", href: "/admin/tutors" },
    { label: "Courses", value: courses.count ?? 0, icon: "menu_book", href: "/admin/courses" },
    { label: "Active batches", value: batches.count ?? 0, icon: "groups", href: "/admin/batches" },
    { label: "Active enrolments", value: enrolments.count ?? 0, icon: "how_to_reg", href: "/admin/batches" },
  ];

  // Filter the window to sessions whose local (tz) date matches today's.
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "numeric" }).format(new Date(now));
  const dateKey = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "numeric" }).format(new Date(iso));
  const recStatus = new Map(((recData ?? []) as { session_id: string; status: string }[]).map((r) => [r.session_id, r.status]));
  const today = ((sessData ?? []) as unknown as TodaySess[]).filter((s) => dateKey(s.starts_at) === todayKey);

  const timeFmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Admin</h1>
        <p className="mt-1 text-muted">Overview of your school.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="rounded-card border border-hairline border-l-4 border-l-gold/40 bg-surface p-6 transition-colors hover:border-gold/40 focus-gold"
          >
            <Icon name={k.icon} className="text-3xl text-gold/50" />
            <p className="mt-3 text-3xl font-bold text-ink">{k.value}</p>
            <p className="text-[11px] uppercase tracking-widest text-muted">{k.label}</p>
          </Link>
        ))}
      </div>

      {/* Today's sessions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Today&apos;s sessions</h2>
        {today.length === 0 ? (
          <p className="rounded-card border border-hairline bg-surface p-6 text-center text-sm text-muted">
            No sessions scheduled for today.
          </p>
        ) : (
          <div className="space-y-3">
            {today.map((s) => {
              const state = computeState(s.starts_at, s.ends_at, (recStatus.get(s.id) as "ready") ?? null, now);
              return (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-4">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{s.title}</p>
                    <p className="text-xs text-muted">{s.batch?.title ?? "—"} · {timeFmt(s.starts_at)}</p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
                    {STATE_LABEL[state] ?? state}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/students" className="rounded-pill bg-cta-gradient px-6 py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold">
          Add student
        </Link>
        <Link href="/admin/batches" className="rounded-pill border border-gold/50 px-6 py-3 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold/10 focus-gold">
          Create batch
        </Link>
      </div>
    </div>
  );
}
