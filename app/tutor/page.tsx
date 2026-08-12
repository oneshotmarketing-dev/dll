import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { Icon } from "@/components/ui/Icon";
import { computeState } from "@/lib/sessionState";
import { partOfDay } from "@/lib/datetime";

interface Sess {
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

export default async function TutorDashboardPage() {
  const user = await getSessionUser();
  const tz = user?.timezone || "UTC";
  const now = Date.now();
  const supabase = createClient();

  const dayStart = new Date(now - 36 * 3600_000).toISOString();
  const dayEnd = new Date(now + 36 * 3600_000).toISOString();

  // RLS scopes these to the tutor's own batches automatically.
  const [batchesRes, { data: sessData }, { data: recData }] = await Promise.all([
    supabase.from("batches").select("id", { count: "exact", head: true }).eq("tutor_id", user?.id ?? ""),
    supabase
      .from("sessions")
      .select("id,title,starts_at,ends_at,status,batch:batches(title)")
      .neq("status", "cancelled")
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd)
      .order("starts_at", { ascending: true }),
    supabase.from("recordings").select("session_id,status"),
  ]);

  const firstName = (user?.fullName || "there").split(" ")[0];

  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
  const dateKey = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  const recStatus = new Map(((recData ?? []) as { session_id: string; status: string }[]).map((r) => [r.session_id, r.status]));
  const today = ((sessData ?? []) as unknown as Sess[]).filter((s) => dateKey(s.starts_at) === todayKey);

  const timeFmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <h1 className="text-3xl font-light text-ink md:text-4xl">
          Good {partOfDay(tz)}, <span className="font-semibold text-gold">{firstName}</span>
        </h1>
        <p className="mt-2 text-muted">Your teaching hub — today&apos;s classes and your batches.</p>
      </section>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <Link href="/tutor/batches" className="rounded-card border border-hairline border-l-4 border-l-gold/40 bg-surface p-6 transition-colors hover:border-gold/40 focus-gold">
          <Icon name="groups" className="text-3xl text-gold/50" />
          <p className="mt-3 text-3xl font-bold text-ink">{batchesRes.count ?? 0}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted">My batches</p>
        </Link>
        <div className="rounded-card border border-hairline border-l-4 border-l-gold/40 bg-surface p-6">
          <Icon name="event" className="text-3xl text-gold/50" />
          <p className="mt-3 text-3xl font-bold text-ink">{today.length}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted">Today&apos;s classes</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">Today&apos;s classes</h2>
        {today.length === 0 ? (
          <p className="rounded-card border border-hairline bg-surface p-6 text-center text-sm text-muted">
            No classes scheduled for today.
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
    </div>
  );
}
