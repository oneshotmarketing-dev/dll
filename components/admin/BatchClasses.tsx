"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Icon } from "@/components/ui/Icon";
import { computeState } from "@/lib/sessionState";
import { zonedToUtc, utcToZonedParts, weekdayOfDate, addDaysStr, durationLabel } from "@/lib/datetime";

export interface SessionRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  join_url: string | null;
  topic: string | null;
  status: string;
  actual_start: string | null;
}
export interface RosterStudent {
  studentId: string;
  fullName: string | null;
}
export interface MaterialItem {
  id: string;
  title: string;
  type: string;
}

const inputClass =
  "min-h-[44px] w-full rounded-input border border-hairline bg-canvas px-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-widest text-gold";

const STATE_LABEL: Record<string, string> = {
  upcoming: "Upcoming",
  joinable: "Joining",
  live: "Live",
  processing: "Ended",
  ready: "Ended",
  unavailable: "Ended",
};

const MAT_ICON: Record<string, string> = {
  pdf: "picture_as_pdf",
  audio: "audio_file",
  video: "video_library",
  interactive: "assignment",
  link: "link",
};

function fmt(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Friendly copy for the server error codes the session routes can return.
function sessionErr(code: unknown): string {
  if (code === "zoom_not_configured") return "Zoom isn't connected yet — add the Zoom keys before scheduling.";
  if (code === "zoom_failed") return "Couldn't create the Zoom meeting. Please try again.";
  if (code === "too_many") return "Too many sessions at once — reduce the count.";
  return typeof code === "string" && code ? code : "Something went wrong. Please try again.";
}

// Open a material inline via its signed URL (same endpoint the student side uses).
async function viewMaterial(id: string) {
  const res = await fetch(`/api/resources/${id}`);
  const d = await res.json().catch(() => ({}));
  if (d.url) window.open(d.url, "_blank", "noopener");
}

export function BatchClasses({
  batchId,
  roster,
  sessions,
  tz,
  recStatus = {},
  materials = {},
  canSchedule = true,
  attendanceGraceMs = null,
}: {
  batchId: string;
  roster: RosterStudent[];
  sessions: SessionRow[];
  tz: string;
  recStatus?: Record<string, string>;
  // Uploaded materials per session id (drives the expanded "Materials" list).
  materials?: Record<string, MaterialItem[]>;
  // Tutors can't schedule/edit/cancel/generate — Deepa owns the calendar.
  canSchedule?: boolean;
  // If set, attendance is editable only within this window after a session ends
  // (tutor grace = 24h). null = never locked (admin).
  attendanceGraceMs?: number | null;
}) {
  const router = useRouter();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editFor, setEditFor] = useState<SessionRow | null>(null);
  const [attendFor, setAttendFor] = useState<SessionRow | null>(null);
  const [uploadFor, setUploadFor] = useState<{ session: SessionRow; kind: "material" | "recording" } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);

  // Cancel/restore go through the admin route so the Zoom meeting is torn down
  // (cancel) or re-created (restore) in step with the DB — never left dangling.
  async function setStatus(id: string, status: string) {
    setBusyId(id);
    await fetch(`/api/admin/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", status }),
    });
    setBusyId(null);
    router.refresh();
  }

  // End a live class early (truncates ends_at to now via a narrow authorized
  // route — tutors can't write sessions directly under phase0f). Reflects
  // everywhere at once: student Join disappears, class moves to Past.
  async function endClass(id: string) {
    setBusyId(id);
    await fetch(`/api/sessions/${id}/end`, { method: "POST" });
    setBusyId(null);
    setConfirmEndId(null);
    router.refresh();
  }

  // Start a class early: stamps actual_start so the session flips to live now
  // (attendance + End class appear) even before the scheduled start time.
  async function startClass(id: string) {
    setBusyId(id);
    await fetch(`/api/sessions/${id}/start`, { method: "POST" });
    setBusyId(null);
    router.refresh();
  }

  // Force a recording row to 'unavailable' (or back to 'processing') so students
  // stop seeing an eternal "Processing" state. Upserts on the session's recording.
  async function setRecording(sessionId: string, status: "unavailable" | "processing", title: string) {
    setBusyId(sessionId);
    const sb = createClient();
    const { data: existing } = await sb.from("recordings").select("id").eq("session_id", sessionId).limit(1).maybeSingle();
    if (existing?.id) {
      await sb.from("recordings").update({ status }).eq("id", existing.id);
    } else {
      await sb.from("recordings").insert({ session_id: sessionId, title, status });
    }
    setBusyId(null);
    router.refresh();
  }

  // Split the flat list into Upcoming vs Past by whether the session has ended,
  // sorting each explicitly (not relying on the caller's query order, which differs
  // between the tutor page (asc) and admin page (desc)):
  //   Upcoming — soonest first;  Past — newest first (just-ended class on top).
  const now = Date.now();
  const startMsOf = (s: SessionRow) => Date.parse(s.starts_at);
  const endMsOf = (s: SessionRow) => (s.ends_at ? Date.parse(s.ends_at) : startMsOf(s) + 2 * 3600_000);
  const upcoming = sessions.filter((s) => now <= endMsOf(s)).sort((a, b) => startMsOf(a) - startMsOf(b));
  const past = sessions.filter((s) => now > endMsOf(s)).sort((a, b) => startMsOf(b) - startMsOf(a));
  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-4">
      {canSchedule ? (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="rounded-pill border border-gold/50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 focus-gold"
          >
            Generate schedule
          </button>
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="rounded-pill bg-cta-gradient px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold"
          >
            Schedule session
          </button>
        </div>
      ) : null}

      {sessions.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-6 text-center text-sm text-muted">
          {canSchedule ? "No sessions yet — schedule the first class." : "No sessions scheduled yet."}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1 border-b border-hairline">
            <TabButton label="Upcoming" count={upcoming.length} active={tab === "upcoming"} onClick={() => { setTab("upcoming"); setExpandedId(null); }} />
            <TabButton label="Past" count={past.length} active={tab === "past"} onClick={() => { setTab("past"); setExpandedId(null); }} />
          </div>
          {visible.length === 0 ? (
            <p className="rounded-card border border-hairline bg-surface p-6 text-center text-sm text-muted">
              {tab === "upcoming" ? "No upcoming classes." : "No past classes yet."}
            </p>
          ) : (
          <div className="space-y-3">
            {visible.map((s) => {
            const cancelled = s.status === "cancelled";
            const rec = (recStatus[s.id] as "processing" | "ready" | "unavailable") ?? null;
            const state = computeState(s.starts_at, s.ends_at, rec, Date.now(), s.actual_start);
            const ended = state === "processing" || state === "ready" || state === "unavailable";
            const busy = busyId === s.id;

            if (cancelled) {
              return (
                <div key={s.id} className="flex flex-col gap-3 rounded-card border border-hairline bg-surface/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-muted line-through">{s.title}</p>
                    <p className="text-xs text-muted">{fmt(s.starts_at, tz)}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="rounded-pill px-2.5 py-0.5 text-[11px] font-bold text-muted" style={{ backgroundColor: "#8A93A31a" }}>
                      Cancelled
                    </span>
                    {canSchedule ? (
                      <button
                        type="button"
                        onClick={() => setStatus(s.id, "scheduled")}
                        disabled={busy}
                        className="rounded-input border border-gold/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 disabled:opacity-60 focus-gold"
                      >
                        {busy ? "…" : "Restore"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            }

            const expanded = expandedId === s.id;
            const canMarkUnavailable = ended && rec !== "ready" && rec !== "unavailable";
            const endMs = s.ends_at ? Date.parse(s.ends_at) : Date.parse(s.starts_at) + 2 * 3600_000;
            const attendanceLocked = attendanceGraceMs != null && Date.now() > endMs + attendanceGraceMs;
            const canTakeAttendance = state === "live" || ended;
            const mats = materials[s.id] ?? [];
            const durMin = s.ends_at ? Math.round((Date.parse(s.ends_at) - Date.parse(s.starts_at)) / 60000) : null;
            return (
              <div key={s.id} className="overflow-hidden rounded-card border border-hairline bg-surface">
                {/* Collapsed header — title/badge toggle expand; Start class sits
                    inline so a teacher can start without expanding. */}
                <div className="flex w-full items-center justify-between gap-3 p-4 transition-colors hover:bg-canvas/40">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : s.id)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 flex-col text-left focus-gold"
                  >
                    <p className="truncate font-bold text-ink">{s.title}</p>
                    <p className="text-xs text-muted">{fmt(s.starts_at, tz)}</p>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {confirmEndId === s.id ? (
                      // Confirming an early end — compact confirm / cancel inline.
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => endClass(s.id)}
                          className="flex items-center gap-1.5 rounded-pill border px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest disabled:opacity-60 focus-gold"
                          style={{ borderColor: "#ffb4ab", color: "#ffb4ab" }}
                        >
                          <Icon name="stop_circle" className="text-sm" /> {busy ? "Ending…" : "Confirm end"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmEndId(null)}
                          className="rounded-pill border border-hairline px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted hover:text-ink disabled:opacity-60 focus-gold"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {state === "joinable" && !s.actual_start ? (
                          <button
                            type="button"
                            disabled={busy}
                            title="Opens the Zoom room and marks the class live"
                            onClick={() => {
                              // Open Zoom synchronously (survives popup blockers), then mark live.
                              if (s.join_url) window.open(s.join_url, "_blank", "noopener,noreferrer");
                              startClass(s.id);
                            }}
                            className="flex items-center gap-1.5 rounded-pill bg-cta-gradient px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold"
                          >
                            <Icon name="play_circle" filled className="text-sm" /> {busy ? "…" : "Start class"}
                          </button>
                        ) : null}
                        {canTakeAttendance ? (
                          <button
                            type="button"
                            title={attendanceLocked ? "View attendance" : "Take / edit attendance"}
                            onClick={() => setAttendFor(s)}
                            className="flex items-center gap-1.5 rounded-pill border border-gold/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold hover:bg-gold/10 focus-gold"
                          >
                            <Icon name={attendanceLocked ? "lock" : "fact_check"} className="text-sm" /> Attendance
                          </button>
                        ) : null}
                        {state === "live" ? (
                          <button
                            type="button"
                            title="End the class now for students"
                            onClick={() => setConfirmEndId(s.id)}
                            className="flex items-center gap-1.5 rounded-pill border border-gold/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold hover:bg-gold/10 focus-gold"
                          >
                            <Icon name="stop_circle" className="text-sm" /> End class
                          </button>
                        ) : null}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : s.id)}
                      aria-expanded={expanded}
                      aria-label={expanded ? "Collapse session" : "Expand session"}
                      className="flex items-center gap-2.5 focus-gold"
                    >
                      <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">{STATE_LABEL[state]}</span>
                      <Icon name={expanded ? "expand_less" : "expand_more"} className="text-lg text-muted" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded ? (
                  <div className="space-y-4 border-t border-hairline px-4 py-4">
                    {/* Info panel */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-card border border-hairline bg-canvas/40 p-4 sm:grid-cols-4">
                      <Meta label="Date & time" value={fmt(s.starts_at, tz)} />
                      <Meta label="Duration" value={durMin ? durationLabel(durMin) : "—"} />
                      <Meta label="Topic" value={s.topic || "—"} />
                      <Meta label="Join link" value="—" link={s.join_url} />
                    </div>

                    {/* Materials + Recording — two balanced cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Materials */}
                      <div className="rounded-card border border-hairline bg-surface p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold">
                            <Icon name="folder_open" className="text-sm" /> Materials
                          </p>
                          <button type="button" onClick={() => setUploadFor({ session: s, kind: "material" })} className="flex items-center gap-1 text-xs font-bold text-gold hover:underline focus-gold">
                            <Icon name="add" className="text-sm" /> Add
                          </button>
                        </div>
                        {mats.length ? (
                          <ul className="space-y-1.5">
                            {mats.map((m) => (
                              <li key={m.id} className="flex items-center justify-between gap-2 rounded-input border border-hairline bg-canvas px-3 py-2">
                                <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                                  <Icon name={MAT_ICON[m.type] ?? "description"} className="text-gold" />
                                  <span className="truncate">{m.title}</span>
                                </span>
                                <button type="button" onClick={() => viewMaterial(m.id)} className="shrink-0 text-xs font-bold text-gold hover:underline focus-gold">
                                  View
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted">No materials uploaded yet.</p>
                        )}
                      </div>

                      {/* Recording */}
                      <div className="rounded-card border border-hairline bg-surface p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold">
                            <Icon name="video_library" className="text-sm" /> Recording
                          </p>
                          <span className="rounded-pill px-2.5 py-0.5 text-[11px] font-bold" style={{ backgroundColor: "#8A93A31a", color: "#8A93A3" }}>
                            {rec === "ready" ? "Available" : rec === "unavailable" ? "Not available" : ended ? "Processing" : "After class"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => setUploadFor({ session: s, kind: "recording" })} className="flex items-center gap-1 text-xs font-bold text-gold hover:underline focus-gold">
                            <Icon name="video_call" className="text-sm" /> Add recording
                          </button>
                          {canMarkUnavailable ? (
                            <button type="button" disabled={busy} onClick={() => setRecording(s.id, "unavailable", s.title)} className="flex items-center gap-1 text-xs font-bold text-muted hover:text-gold focus-gold disabled:opacity-60">
                              <Icon name="videocam_off" className="text-sm" /> Mark unavailable
                            </button>
                          ) : null}
                          {rec === "unavailable" ? (
                            <button type="button" disabled={busy} onClick={() => setRecording(s.id, "processing", s.title)} className="flex items-center gap-1 text-xs font-bold text-muted hover:text-gold focus-gold disabled:opacity-60">
                              <Icon name="undo" className="text-sm" /> Undo
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Admin session actions */}
                    {canSchedule ? (
                      <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
                        <button type="button" onClick={() => setEditFor(s)} className="flex items-center gap-1 rounded-input border border-hairline px-4 py-2 text-xs font-bold text-muted transition-colors hover:border-gold hover:text-gold focus-gold">
                          <Icon name="edit" className="text-sm" /> Edit session
                        </button>
                        <button type="button" disabled={busy} onClick={() => setStatus(s.id, "cancelled")} className="flex items-center gap-1 rounded-input border border-hairline px-4 py-2 text-xs font-bold text-muted transition-colors hover:border-[#ffb4ab] hover:text-[#ffb4ab] focus-gold disabled:opacity-60">
                          <Icon name="cancel" className="text-sm" /> Cancel session
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
            })}
          </div>
          )}
        </div>
      )}

      {scheduleOpen ? (
        <ScheduleDialog batchId={batchId} tz={tz} onClose={() => setScheduleOpen(false)} onDone={() => { setScheduleOpen(false); router.refresh(); }} />
      ) : null}
      {editFor ? (
        <ScheduleDialog batchId={batchId} tz={tz} session={editFor} onClose={() => setEditFor(null)} onDone={() => { setEditFor(null); router.refresh(); }} />
      ) : null}
      {generateOpen ? (
        <GenerateDialog batchId={batchId} tz={tz} existingCount={sessions.length} onClose={() => setGenerateOpen(false)} onDone={() => { setGenerateOpen(false); router.refresh(); }} />
      ) : null}
      {attendFor ? (
        <AttendanceDialog session={attendFor} roster={roster} graceMs={attendanceGraceMs} onClose={() => setAttendFor(null)} onDone={() => { setAttendFor(null); router.refresh(); }} />
      ) : null}
      {uploadFor ? (
        <UploadDialog session={uploadFor.session} kind={uploadFor.kind} onClose={() => setUploadFor(null)} onDone={() => { setUploadFor(null); router.refresh(); }} />
      ) : null}
    </div>
  );
}

function TabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors focus-gold ${
        active ? "border-gold text-gold" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {label}
      <span className={`rounded-pill px-2 py-0.5 text-[10px] ${active ? "bg-gold/15 text-gold" : "bg-canvas text-muted"}`}>{count}</span>
    </button>
  );
}

function Meta({ label, value, link }: { label: string; value: string; link?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-muted">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gold hover:underline focus-gold">
          Open link
        </a>
      ) : (
        <p className="truncate text-sm font-medium text-ink">{value}</p>
      )}
    </div>
  );
}

function UploadDialog({ session, kind, onClose, onDone }: { session: SessionRow; kind: "material" | "recording"; onClose: () => void; onDone: () => void }) {
  const isMaterial = kind === "material";
  const [title, setTitle] = useState(isMaterial ? "" : session.title);
  const [type, setType] = useState("pdf");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const accept = !isMaterial ? "video/*" : type === "pdf" ? ".pdf" : type === "audio" ? "audio/*" : "video/*";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file.");
      return;
    }
    if (isMaterial && !title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(undefined);
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sessionId", session.id);
    fd.append("title", (isMaterial ? title : title || session.title).trim());
    if (isMaterial) {
      fd.append("type", type);
      fd.append("description", description);
    }
    const res = await fetch(isMaterial ? "/api/admin/resources" : "/api/admin/recordings", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(d.error === "too_large" ? "File too large (max 50 MB on the current plan)." : d.error || "Upload failed.");
      return;
    }
    onDone();
  }

  return (
    <Modal title={isMaterial ? "Add material" : "Add recording"} onClose={onClose}>
      <p className="mb-4 text-sm text-muted">{session.title}</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required={isMaterial} placeholder={session.title} className={inputClass} />
        </div>
        {isMaterial ? (
          <>
            <div>
              <label className={labelClass}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="video">Video (watch-only)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Description (optional)</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
            </div>
          </>
        ) : null}
        <div>
          <label className={labelClass}>File</label>
          <input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full text-sm text-muted file:mr-3 file:rounded-input file:border-0 file:bg-gold/10 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-gold"
          />
        </div>
        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
          {loading ? "Uploading…" : "Upload"}
        </button>
      </form>
    </Modal>
  );
}

function ScheduleDialog({ batchId, tz, session, onClose, onDone }: { batchId: string; tz: string; session?: SessionRow; onClose: () => void; onDone: () => void }) {
  const editing = !!session;
  const initialDuration = session?.ends_at
    ? String(Math.round((Date.parse(session.ends_at) - Date.parse(session.starts_at)) / 60000))
    : "120";
  // Prefill the date/time inputs as the wall-clock time in the admin's saved tz.
  const initial = session ? utcToZonedParts(session.starts_at, tz) : { date: "", time: "19:00" };
  const [title, setTitle] = useState(session?.title ?? "");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [duration, setDuration] = useState(initialDuration);
  const [topic, setTopic] = useState(session?.topic ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      setError("Title, date and time are required.");
      return;
    }
    // Interpret the entered date+time as wall-clock time in the admin's saved
    // timezone → the correct UTC instant (DST-aware).
    const start = zonedToUtc(date, time, tz);
    const end = new Date(start.getTime() + Number(duration || 120) * 60000);
    setError(undefined);
    setLoading(true);
    // Create/edit go through the admin route, which auto-creates (or reschedules)
    // the Zoom meeting and fills in the join link — no manual link needed.
    const values = {
      title: title.trim(),
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      topic: topic.trim() || null,
    };
    const res = editing
      ? await fetch(`/api/admin/sessions/${session!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reschedule", ...values }),
        })
      : await fetch("/api/admin/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchId, sessions: [values] }),
        });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(sessionErr(d.error));
      return;
    }
    onDone();
  }

  return (
    <Modal title={editing ? "Edit session" : "Schedule session"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>Session title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="TEF Speaking Practice — Unit 5" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <p className="-mt-2 text-[11px] text-muted">Times entered in {tz.replace(/_/g, " ")}.</p>
        <div>
          <label className={labelClass}>Duration (min)</label>
          <input type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Today&apos;s topic (optional)</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass} />
        </div>
        <p className="flex items-center gap-1.5 rounded-input border border-gold/30 bg-gold/5 px-3 py-2 text-[11px] text-gold">
          <Icon name="videocam" className="text-sm" />
          A Zoom meeting + join link is created automatically.
        </p>
        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
          {loading ? "Saving…" : editing ? "Save changes" : "Schedule session"}
        </button>
      </form>
    </Modal>
  );
}

// Mon-first weekday picker order (value = JS getDay()).
const WEEKDAYS = [
  { v: 1, label: "M" }, { v: 2, label: "T" }, { v: 3, label: "W" }, { v: 4, label: "T" },
  { v: 5, label: "F" }, { v: 6, label: "S" }, { v: 0, label: "S" },
];

function GenerateDialog({ batchId, tz, existingCount, onClose, onDone }: { batchId: string; tz: string; existingCount: number; onClose: () => void; onDone: () => void }) {
  const [startDate, setStartDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState("120");
  const [count, setCount] = useState("16");
  const [days, setDays] = useState<Set<number>>(new Set([2, 4])); // Tue & Thu default
  const [preview, setPreview] = useState<Date[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function toggleDay(v: number) {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
    setPreview(null);
  }

  function computeDates(): Date[] {
    const n = Math.max(1, Math.min(200, Number(count) || 0));
    const dates: Date[] = [];
    if (!startDate || days.size === 0) return dates;
    // Walk calendar dates from the start; for each matching weekday, interpret
    // the entered time as wall-clock in the admin's saved tz → UTC instant.
    let cursor = startDate;
    for (let i = 0; i < 366 && dates.length < n; i++) {
      if (days.has(weekdayOfDate(cursor))) dates.push(zonedToUtc(cursor, time, tz));
      cursor = addDaysStr(cursor, 1);
    }
    return dates;
  }

  function buildPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !time) return setError("Pick a start date and time.");
    if (days.size === 0) return setError("Select at least one weekday.");
    const d = computeDates();
    if (!d.length) return setError("No dates matched — check your inputs.");
    setError(undefined);
    setPreview(d);
  }

  async function create() {
    if (!preview) return;
    setLoading(true);
    setError(undefined);
    const dur = Number(duration || 120);
    // One Zoom meeting is auto-created per session server-side, so a big batch
    // can take a few seconds.
    const sessions = preview.map((d, i) => ({
      title: `Session ${existingCount + i + 1}`,
      starts_at: d.toISOString(),
      ends_at: new Date(d.getTime() + dur * 60000).toISOString(),
      topic: null,
    }));
    const res = await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId, sessions }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(sessionErr(d.error));
    onDone();
  }

  return (
    <Modal title="Generate schedule" onClose={onClose}>
      {existingCount > 0 ? (
        <p className="mb-4 rounded-input border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-gold">
          This batch already has {existingCount} session{existingCount === 1 ? "" : "s"} — new ones will be added, numbered from {existingCount + 1}.
        </p>
      ) : null}

      {preview ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">{preview.length} sessions will be created:</p>
          <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-input border border-hairline bg-canvas p-3">
            {preview.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-bold text-ink">Session {existingCount + i + 1}</span>
                <span className="text-muted">{fmt(d.toISOString(), tz)}</span>
              </div>
            ))}
          </div>
          {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
          <div className="flex gap-3">
            <button type="button" onClick={() => setPreview(null)} className="flex-1 rounded-pill border border-hairline py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-ink focus-gold">
              Back
            </button>
            <button type="button" onClick={create} disabled={loading} className="flex-1 rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
              {loading ? "Creating…" : `Create ${preview.length}`}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={buildPreview} className="space-y-4">
          <div>
            <label className={labelClass}>Weekdays</label>
            <div className="flex gap-2">
              {WEEKDAYS.map((d, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(d.v)}
                  className={`h-10 w-10 rounded-input border text-sm font-bold transition-colors focus-gold ${days.has(d.v) ? "border-gold bg-gold text-canvas" : "border-hairline text-muted hover:border-gold/50"}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start date</label>
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPreview(null); }} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputClass} />
            </div>
          </div>
          <p className="-mt-2 text-[11px] text-muted">Times entered in {tz.replace(/_/g, " ")}.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Duration (min)</label>
              <input type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Number of sessions</label>
              <input type="number" min="1" max="200" value={count} onChange={(e) => setCount(e.target.value)} className={inputClass} />
            </div>
          </div>
          <p className="flex items-center gap-1.5 rounded-input border border-gold/30 bg-gold/5 px-3 py-2 text-[11px] text-gold">
            <Icon name="videocam" className="text-sm" />
            Each session gets its own Zoom meeting + join link automatically.
          </p>
          {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
          <button type="submit" className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold">
            Preview schedule
          </button>
        </form>
      )}
    </Modal>
  );
}

function AttendanceDialog({ session, roster, graceMs = null, onClose, onDone }: { session: SessionRow; roster: RosterStudent[]; graceMs?: number | null; onClose: () => void; onDone: () => void }) {
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Tutor grace window: once past it, attendance is admin-only (read-only here).
  const endMs = session.ends_at ? Date.parse(session.ends_at) : Date.parse(session.starts_at) + 2 * 3600_000;
  const locked = graceMs != null && Date.now() > endMs + graceMs;

  // Load any existing attendance for this session.
  useEffect(() => {
    let active = true;
    createClient()
      .from("attendance")
      .select("student_id,status")
      .eq("session_id", session.id)
      .then(({ data }) => {
        if (!active) return;
        const m: Record<string, string> = {};
        (data ?? []).forEach((a: { student_id: string; status: string }) => (m[a.student_id] = a.status));
        setMarks(m);
      });
    return () => {
      active = false;
    };
  }, [session.id]);

  async function save() {
    setLoading(true);
    // Binary attendance: each student is present (ticked) or absent.
    const rows = roster.map((r) => ({
      session_id: session.id,
      student_id: r.studentId,
      status: marks[r.studentId] === "present" ? "present" : "absent",
    }));
    if (rows.length) {
      await createClient().from("attendance").upsert(rows, { onConflict: "session_id,student_id" });
    }
    setLoading(false);
    onDone();
  }

  const presentCount = roster.filter((r) => marks[r.studentId] === "present").length;

  return (
    <Modal title="Attendance" onClose={onClose}>
      <p className="mb-4 text-sm text-muted">{session.title}</p>
      {locked ? (
        <p className="mb-4 flex items-center gap-2 rounded-input border border-hairline bg-canvas px-3 py-2 text-xs text-muted">
          <Icon name="lock" className="text-sm text-gold" />
          Locked — this class ended over 24h ago. Ask an admin to amend attendance.
        </p>
      ) : null}

      {roster.length === 0 ? (
        <p className="rounded-card border border-hairline bg-canvas p-6 text-center text-sm text-muted">No students enrolled.</p>
      ) : (
        <>
          {!locked ? (
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">
                <span className="font-bold text-ink">{presentCount}</span> of {roster.length} present
              </p>
              <button
                type="button"
                onClick={() => setMarks(Object.fromEntries(roster.map((r) => [r.studentId, "present"])))}
                className="flex items-center gap-1 text-xs font-bold text-gold hover:underline focus-gold"
              >
                <Icon name="done_all" className="text-sm" /> Mark all present
              </button>
            </div>
          ) : null}

          <div className="space-y-2">
            {roster.map((r) => {
              const present = marks[r.studentId] === "present";
              return (
                <button
                  key={r.studentId}
                  type="button"
                  disabled={locked}
                  onClick={() => setMarks((m) => ({ ...m, [r.studentId]: present ? "absent" : "present" }))}
                  className="flex w-full items-center justify-between gap-3 rounded-input border border-hairline bg-canvas px-3 py-2.5 text-left transition-colors hover:border-gold/40 disabled:opacity-60 focus-gold"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-surface text-xs font-bold text-gold">
                      {(r.fullName || "S").trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-ink">{r.fullName ?? "Student"}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    <span className="text-xs font-bold" style={{ color: present ? "#22c55e" : "#8A93A3" }}>
                      {present ? "Present" : "Absent"}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border ${present ? "" : "border-hairline"}`}
                      style={present ? { backgroundColor: "#22c55e", borderColor: "#22c55e" } : undefined}
                    >
                      {present ? <Icon name="check" className="text-sm text-canvas" /> : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {locked ? (
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-pill border border-hairline py-3 text-xs font-bold uppercase tracking-widest text-muted hover:text-ink focus-gold">
          Close
        </button>
      ) : (
        <button type="button" onClick={save} disabled={loading} className="mt-5 w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
          {loading ? "Saving…" : "Save attendance"}
        </button>
      )}
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-gold focus-gold">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
