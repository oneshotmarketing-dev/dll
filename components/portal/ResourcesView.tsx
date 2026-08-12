"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabaseClient";
import { MediaModal } from "@/components/portal/MediaModal";

export interface ResItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  duration: number | null;
  courseTitle: string;
  isNew: boolean;
}
export interface ResGroup {
  sessionId: string;
  sessionTitle: string;
  dateLabel: string;
  items: ResItem[];
}

const META: Record<string, { icon: string; color: string; label: string }> = {
  pdf: { icon: "picture_as_pdf", color: "#ef4444", label: "PDF" },
  audio: { icon: "audio_file", color: "#3b82f6", label: "Audio" },
  video: { icon: "video_library", color: "#C5A36B", label: "Video" },
  interactive: { icon: "assignment", color: "#22c55e", label: "Exercise" },
  link: { icon: "link", color: "#96A9CE", label: "Link" },
};

const selectClass =
  "min-h-[42px] rounded-input border border-hairline bg-canvas px-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

export function ResourcesView({
  groups,
  courses,
  studentId,
  subtitle,
}: {
  groups: ResGroup[];
  courses: string[];
  studentId: string;
  subtitle: string;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [course, setCourse] = useState("all");
  const [session, setSession] = useState("all");
  const [open, setOpen] = useState<{ id: string; title: string; subtitle: string } | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  function markViewed(id: string) {
    if (viewed.has(id)) return;
    setViewed((v) => new Set(v).add(id));
    createClient().from("resource_views").upsert({ student_id: studentId, resource_id: id }).then(() => {});
  }
  function download(it: ResItem) {
    markViewed(it.id);
    fetch(`/api/resources/${it.id}?download=1`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("nope"))))
      .then((d) => {
        window.location.href = d.url;
      })
      .catch(() => {});
  }
  function watch(it: ResItem) {
    markViewed(it.id);
    setOpen({ id: it.id, title: it.title, subtitle: it.courseTitle });
  }

  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (it) =>
              (type === "all" || it.type === type) &&
              (course === "all" || it.courseTitle === course) &&
              (session === "all" || g.sessionId === session) &&
              (!q || `${it.title} ${it.description ?? ""}`.toLowerCase().includes(q.toLowerCase())),
          ),
        }))
        .filter((g) => g.items.length > 0),
    [groups, q, type, course, session],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Resources</h1>
        <p className="mt-1 text-muted">Course materials for your batch{subtitle ? ` · ${subtitle}` : ""}</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials…"
            className="min-h-[42px] w-full rounded-input border border-hairline bg-canvas pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={course} onChange={(e) => setCourse(e.target.value)} className={selectClass} aria-label="Course">
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass} aria-label="Type">
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
          <select value={session} onChange={(e) => setSession(e.target.value)} className={selectClass} aria-label="Session">
            <option value="all">All Sessions</option>
            {groups.map((g) => (
              <option key={g.sessionId} value={g.sessionId}>{g.sessionTitle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped by session */}
      {filtered.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">
          {groups.length === 0
            ? "No materials yet — resources your trainer shares will appear here."
            : "No materials match your filters."}
        </p>
      ) : (
        filtered.map((g) => (
          <section key={g.sessionId} className="space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="whitespace-nowrap text-sm font-bold text-ink">
                {g.sessionTitle} <span className="font-normal text-muted">· {g.dateLabel}</span>
              </h2>
              <div className="h-px w-full bg-hairline" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => {
                const meta = META[it.type] ?? META.link;
                const isNew = it.isNew && !viewed.has(it.id);
                const isVideo = it.type === "video";
                return (
                  <div key={it.id} className="relative flex flex-col rounded-card border border-hairline bg-surface p-6">
                    {isNew ? (
                      <span className="absolute -right-2 -top-2 rounded-pill bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-canvas shadow-lg">
                        New
                      </span>
                    ) : null}
                    <div className="mb-4 flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-input"
                        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                      >
                        <Icon name={meta.icon} filled={isVideo} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-widest text-muted">{meta.label}</span>
                    </div>
                    <h3 className="font-bold text-ink">{it.title}</h3>
                    {it.description ? <p className="mt-1 flex-1 text-xs text-muted">{it.description}</p> : <div className="flex-1" />}
                    <button
                      type="button"
                      onClick={() => (isVideo ? watch(it) : download(it))}
                      className={cn(
                        "mt-5 flex items-center justify-center gap-2 rounded-input py-2.5 text-xs font-bold uppercase tracking-widest transition-all focus-gold",
                        isVideo
                          ? "bg-cta-gradient text-canvas shadow-glow-btn"
                          : "border border-gold/40 text-gold hover:bg-gold/10",
                      )}
                    >
                      <Icon name={isVideo ? "play_circle" : "download"} filled={isVideo} className="text-sm" />
                      {isVideo ? "Watch" : "Download"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {open ? (
        <MediaModal
          endpoint={`/api/resources/${open.id}`}
          title={open.title}
          subtitle={open.subtitle}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
