import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/portal";
import { Icon } from "@/components/ui/Icon";
import { NextClassHero, type HeroSession } from "@/components/portal/NextClassHero";
import { computeState } from "@/lib/sessionState";
import {
  partOfDay,
  dateBadge,
  timeLabel,
  dateTimeLabel,
  relativeDay,
  durationLabel,
} from "@/lib/datetime";

interface Sess {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  join_url: string | null;
  topic: string | null;
  batch: { title: string; tutor: { full_name: string | null } | null } | null;
}
interface Enr {
  batch: { id: string; title: string } | null;
  course: { title: string; language: { name: string } | null } | null;
}

const HOUR = 3600_000;
const DAY = 86_400_000;
const startMs = (s: Sess) => Date.parse(s.starts_at);
const endMs = (s: Sess) => (s.ends_at ? Date.parse(s.ends_at) : startMs(s) + 2 * HOUR);

const RES_ICON: Record<string, { icon: string; color: string }> = {
  pdf: { icon: "picture_as_pdf", color: "#ef4444" },
  audio: { icon: "audio_file", color: "#3b82f6" },
  video: { icon: "video_library", color: "#C5A36B" },
  interactive: { icon: "assignment", color: "#22c55e" },
  link: { icon: "link", color: "#96A9CE" },
};

export default async function StudentDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const tz = user.timezone || "UTC";
  const now = Date.now();
  const supabase = createClient();

  const [enrRes, sessRes, attRes, recRes, resRes, viewRes] = await Promise.all([
    supabase
      .from("enrollments")
      .select("batch:batches(id,title), course:courses(title,language:languages(name))")
      .eq("status", "active"),
    supabase
      .from("sessions")
      .select("id,title,starts_at,ends_at,join_url,topic,batch:batches(title,tutor:profiles(full_name))")
      .neq("status", "cancelled")
      .order("starts_at", { ascending: true }),
    supabase.from("attendance").select("session_id,status"),
    supabase.from("recordings").select("id,session_id,title,duration,recorded_at,status"),
    supabase.from("resources").select("id,title,description,type,created_at,session:sessions!inner(status)").order("created_at", { ascending: false }).limit(6),
    supabase.from("recording_views").select("recording_id"),
  ]);

  const enrollments = (enrRes.data ?? []) as unknown as Enr[];
  const sessions = (sessRes.data ?? []) as unknown as Sess[];
  const attendance = (attRes.data ?? []) as { session_id: string; status: string }[];
  const recordings = (recRes.data ?? []) as { id: string; session_id: string; title: string; duration: number | null; recorded_at: string | null; status: string }[];
  // Mirror the Resources page: only session-linked, non-cancelled materials, so the
  // dashboard preview never teases a resource the full Resources page won't show.
  const resources = ((resRes.data ?? []) as unknown as {
    id: string; title: string; description: string | null; type: string; created_at: string;
    session: { status: string } | null;
  }[])
    .filter((r) => r.session && r.session.status !== "cancelled")
    .slice(0, 3);
  const viewed = new Set((viewRes.data ?? []).map((v: { recording_id: string }) => v.recording_id));

  const firstName = (user.fullName || "there").split(" ")[0];
  const contextLines = enrollments
    .map((e) => [e.course?.language?.name, e.batch?.title].filter(Boolean).join(" · "))
    .filter(Boolean);

  const ended = sessions.filter((s) => now > endMs(s));
  const notEnded = sessions.filter((s) => now <= endMs(s));

  // Stats (merged across all batches). Attendance is scoped to the sessions the
  // student can currently see (enrolled + not cancelled) — the same universe as
  // the Sessions/Classes stats — so leaving a batch or a cancelled class can't
  // leave orphaned marks skewing the percentage.
  const visibleSessionIds = new Set(sessions.map((s) => s.id));
  const relevantAttendance = attendance.filter((a) => visibleSessionIds.has(a.session_id));
  const attended = relevantAttendance.filter((a) => a.status === "present" || a.status === "late").length;
  const marked = relevantAttendance.length;
  const attendancePct = marked ? Math.round((attended / marked) * 100) : 0;
  const classesThisWeek = notEnded.filter((s) => startMs(s) <= now + 7 * DAY).length;
  const nextSess = notEnded[0];

  // Hero: soonest not-ended session; render if live/joinable, or upcoming within 4h.
  const hero = notEnded[0];
  const heroState = hero ? computeState(hero.starts_at, hero.ends_at, null, now) : null;
  const showHero =
    hero &&
    (heroState === "live" || heroState === "joinable" || startMs(hero) - now <= 4 * HOUR);
  const heroProps: HeroSession | null = showHero
    ? {
        title: hero.title,
        startsAt: hero.starts_at,
        endsAt: hero.ends_at,
        joinUrl: hero.join_url,
        topic: hero.topic,
        trainer: hero.batch?.tutor?.full_name ?? null,
        dateTime: dateTimeLabel(hero.starts_at, tz),
        serverNow: now,
      }
    : null;

  // Recent recordings strip — driven by ended sessions + their ready recording.
  const recBySession = new Map(recordings.map((r) => [r.session_id, r]));
  const recentEnded = [...ended].sort((a, b) => endMs(b) - endMs(a)).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Greeting */}
      <section>
        <h1 className="text-3xl font-light text-ink md:text-4xl">
          Good {partOfDay(tz)}, <span className="font-semibold text-gold">{firstName}</span>
        </h1>
        {contextLines.length ? (
          <p className="mt-2 text-muted">{contextLines.join("   ·   ")}</p>
        ) : null}
      </section>

      {/* Hero */}
      {heroProps ? <NextClassHero {...heroProps} /> : null}

      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon="task_alt" label="Sessions Completed" value={`${ended.length} / ${sessions.length}`} sub="Across your batches" />
        <StatCard icon="person_check" label="Attendance" value={marked ? `${attendancePct}%` : "—"} sub={marked ? `${attended} of ${marked} attended` : "No attendance yet"} />
        <StatCard
          icon="calendar_month"
          label="Classes This Week"
          value={String(classesThisWeek).padStart(2, "0")}
          sub={nextSess ? `Next: ${relativeDay(nextSess.starts_at, tz, new Date())} ${timeLabel(nextSess.starts_at, tz)}` : "No upcoming classes"}
        />
      </section>

      {/* Upcoming + recordings */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Upcoming */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-ink">Upcoming classes</h2>
            <Link href="/student/live-classes" className="text-xs font-bold text-gold hover:underline focus-gold">
              View schedule
            </Link>
          </div>
          <div className="space-y-3">
            {notEnded.slice(0, 5).map((s) => {
              const st = computeState(s.starts_at, s.ends_at, null, now);
              const badge = dateBadge(s.starts_at, tz);
              const joinable = st === "joinable" || st === "live";
              return (
                <div
                  key={s.id}
                  className={cnRow(joinable)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-input border border-hairline bg-canvas">
                      <span className="text-[10px] font-bold text-gold">{badge.month}</span>
                      <span className="text-xl font-bold text-ink">{badge.day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink">{s.title}</p>
                      <p className="text-xs text-muted">
                        {timeLabel(s.starts_at, tz)}
                        {s.batch?.tutor?.full_name ? ` · ${s.batch.tutor.full_name}` : ""}
                      </p>
                    </div>
                  </div>
                  {joinable ? (
                    <a
                      href={s.join_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-pill bg-cta-gradient px-6 py-2 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold"
                    >
                      Join
                    </a>
                  ) : (
                    <span className="shrink-0 text-xs font-bold text-muted">
                      {relativeDay(s.starts_at, tz, new Date())}
                    </span>
                  )}
                </div>
              );
            })}
            {notEnded.length === 0 ? (
              <p className="rounded-card border border-hairline bg-surface p-6 text-sm text-muted">
                Your batch schedule is complete — message us on WhatsApp to join the next batch.
              </p>
            ) : null}
          </div>
        </div>

        {/* Recent recordings */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-ink">Recent recordings</h2>
            <Link href="/student/recordings" className="text-xs font-bold text-gold hover:underline focus-gold">
              See library
            </Link>
          </div>
          <div className="space-y-3">
            {recentEnded.map((s) => {
              const rec = recBySession.get(s.id);
              const st = computeState(s.starts_at, s.ends_at, (rec?.status as "ready") ?? null, now);
              const isNew = rec && st === "ready" && !viewed.has(rec.id);
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-4">
                  <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-input border border-hairline bg-canvas">
                    <Icon
                      name={st === "ready" ? "play_arrow" : st === "processing" ? "progress_activity" : "videocam_off"}
                      filled={st === "ready"}
                      className={st === "ready" ? "text-gold" : "text-muted"}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{s.title}</p>
                    <p className="text-[11px] text-muted">
                      {st === "ready"
                        ? `${relativeDay(s.starts_at, tz, new Date())} · ${durationLabel(rec?.duration)}`
                        : st === "processing"
                          ? "Processing — available soon"
                          : "Recording not available"}
                    </p>
                    {st === "ready" ? (
                      <Link href="/student/recordings" className="text-[11px] font-bold text-gold hover:underline">
                        Watch
                      </Link>
                    ) : null}
                  </div>
                  {isNew ? (
                    <span className="shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-gold">
                      New
                    </span>
                  ) : null}
                </div>
              );
            })}
            {recentEnded.length === 0 ? (
              <p className="rounded-card border border-hairline bg-surface p-6 text-sm text-muted">
                Replays appear here after your first class.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink">Your resources</h2>
          <Link href="/student/resources" className="text-xs font-bold text-gold hover:underline focus-gold">
            Explore all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {resources.map((r) => {
            const meta = RES_ICON[r.type] ?? RES_ICON.link;
            return (
              <div key={r.id} className="rounded-card border border-hairline bg-surface p-6 transition-colors hover:border-gold/40">
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-input border"
                    style={{ borderColor: `${meta.color}33`, backgroundColor: `${meta.color}1a`, color: meta.color }}
                  >
                    <Icon name={meta.icon} />
                  </span>
                  <span className="rounded bg-canvas px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                    {r.type}
                  </span>
                </div>
                <h3 className="mb-1 font-bold text-ink">{r.title}</h3>
                {r.description ? <p className="mb-4 text-xs text-muted">{r.description}</p> : null}
                <Link href="/student/resources" className="flex items-center gap-1 text-xs font-bold text-gold hover:underline">
                  Open <Icon name="arrow_outward" className="text-sm" />
                </Link>
              </div>
            );
          })}
          {resources.length === 0 ? (
            <p className="rounded-card border border-hairline bg-surface p-6 text-sm text-muted md:col-span-3">
              Resources your trainer shares will appear here.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-center justify-between rounded-card border border-hairline border-l-4 border-l-gold/40 bg-surface p-6">
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-widest text-muted">{label}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
        <p className="mt-1 text-[10px] text-muted">{sub}</p>
      </div>
      <Icon name={icon} className="text-4xl text-gold/40" />
    </div>
  );
}

function cnRow(joinable: boolean): string {
  return `flex items-center justify-between gap-3 rounded-card border bg-surface p-5 ${
    joinable ? "border-gold/40 shadow-glow-card" : "border-hairline"
  }`;
}
