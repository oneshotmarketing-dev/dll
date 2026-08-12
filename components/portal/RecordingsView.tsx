"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabaseClient";
import { MediaModal } from "@/components/portal/MediaModal";

export interface RecItem {
  sessionId: string;
  recordingId: string | null;
  title: string;
  monthLabel: string;
  dateLabel: string;
  endTimeLabel: string;
  duration: string;
  batchTitle: string;
  state: "ready" | "processing" | "unavailable";
  isNew: boolean;
}

function monthGroups(items: RecItem[]): { label: string; items: RecItem[] }[] {
  const out: { label: string; items: RecItem[] }[] = [];
  for (const it of items) {
    const last = out[out.length - 1];
    if (last && last.label === it.monthLabel) last.items.push(it);
    else out.push({ label: it.monthLabel, items: [it] });
  }
  return out;
}

export function RecordingsView({
  items,
  studentId,
  batchCount,
  subtitle,
}: {
  items: RecItem[];
  studentId: string;
  batchCount: number;
  subtitle: string;
}) {
  const [open, setOpen] = useState<RecItem | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());

  function watch(it: RecItem) {
    if (!it.recordingId) return;
    setOpen(it);
    if (it.isNew && !viewed.has(it.recordingId)) {
      setViewed((v) => new Set(v).add(it.recordingId!));
      createClient()
        .from("recording_views")
        .upsert({ student_id: studentId, recording_id: it.recordingId })
        .then(() => {});
    }
  }

  // Flat while the student has one batch; grouped by batch when >1 (§7).
  const batches = batchCount > 1 ? [...new Set(items.map((i) => i.batchTitle))] : [""];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Recordings</h1>
        <p className="mt-1 text-muted">Replays from your live sessions{subtitle ? ` · ${subtitle}` : ""}</p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-8 text-center text-muted">
          No recordings yet — your session replays will appear here after your first class.
        </p>
      ) : (
        batches.map((batch) => {
          const scoped = batch ? items.filter((i) => i.batchTitle === batch) : items;
          return (
            <section key={batch || "all"} className="space-y-6">
              {batch ? <h2 className="text-lg font-bold text-ink">{batch}</h2> : null}
              {monthGroups(scoped).map((g) => (
                <div key={g.label} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="whitespace-nowrap text-[11px] font-bold tracking-[0.2em] text-muted">{g.label}</span>
                    <div className="h-px w-full bg-hairline" />
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {g.items.map((it) => (
                      <Card key={it.sessionId} it={it} isNew={it.isNew && !viewed.has(it.recordingId ?? "")} onWatch={() => watch(it)} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}

      {open && open.recordingId ? (
        <MediaModal
          endpoint={`/api/recordings/${open.recordingId}`}
          title={open.title}
          subtitle={`${open.dateLabel}${open.duration ? ` · ${open.duration}` : ""}`}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}

function Card({ it, isNew, onWatch }: { it: RecItem; isNew: boolean; onWatch: () => void }) {
  const ready = it.state === "ready";
  const processing = it.state === "processing";

  return (
    <div className={`overflow-hidden rounded-card border border-hairline bg-surface ${ready ? "" : "opacity-60"}`}>
      <button
        type="button"
        onClick={ready ? onWatch : undefined}
        disabled={!ready}
        className="group relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-canvas to-surface focus-gold"
      >
        {ready ? (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-glow-btn transition-transform group-hover:scale-110">
              <Icon name="play_arrow" filled className="text-3xl text-canvas" />
            </span>
            {isNew ? (
              <span className="absolute right-3 top-3 rounded-pill bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-canvas">
                New
              </span>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <Icon
              name={processing ? "progress_activity" : "videocam_off"}
              className={processing ? "animate-spin text-3xl text-gold/50" : "text-3xl"}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              {processing ? "Available soon" : "Not available"}
            </span>
          </div>
        )}
      </button>
      <div className="p-5">
        <h3 className="truncate font-bold text-ink">{it.title}</h3>
        <p className="mt-1 text-xs text-muted">
          {it.dateLabel}
          {it.endTimeLabel ? ` · ${it.endTimeLabel}` : ""}
          {ready && it.duration ? ` · ${it.duration}` : processing ? " · Processing" : ""}
        </p>
        {ready ? (
          <button type="button" onClick={onWatch} className="mt-3 text-xs font-bold text-gold hover:underline focus-gold">
            Watch
          </button>
        ) : null}
      </div>
    </div>
  );
}
