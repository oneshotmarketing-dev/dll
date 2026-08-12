"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { computeState } from "@/lib/sessionState";
import { relativeDay } from "@/lib/datetime";
import { downloadIcs, type IcsEvent } from "@/lib/ics";
import { NextClassHero } from "@/components/portal/NextClassHero";

export interface ClassRow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  joinUrl: string | null;
  topic: string | null;
  trainer: string | null;
  batchTitle: string;
  badge: { month: string; day: string };
  weekday: string;
  time: string;
  duration: string;
  dateTime: string;
  attendance: string | null;
  recordingStatus: string | null;
}
export interface BatchProgress {
  title: string;
  trainer: string | null;
  total: number;
  ended: number;
}

const endMs = (r: ClassRow) =>
  r.endsAt ? Date.parse(r.endsAt) : Date.parse(r.startsAt) + 2 * 3600_000;

export function LiveClassesView({
  batches,
  rows,
  tz,
  serverNow,
  subtitle,
}: {
  batches: BatchProgress[];
  rows: ClassRow[];
  tz: string;
  serverNow: number;
  subtitle: string;
}) {
  const [now, setNow] = useState(serverNow);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const upcoming = rows.filter((r) => now <= endMs(r));
  const past = rows.filter((r) => now > endMs(r)).sort((a, b) => endMs(b) - endMs(a));
  const banner = upcoming[0];
  const bannerState = banner ? computeState(banner.startsAt, banner.endsAt, null, now) : null;
  const showBanner =
    banner &&
    (bannerState === "live" || bannerState === "joinable" || Date.parse(banner.startsAt) - now <= 4 * 3600_000);

  const toIcs = (r: ClassRow): IcsEvent => ({
    id: r.id,
    title: r.title,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    location: r.joinUrl ?? undefined,
    description: r.joinUrl ? `Join the Zoom class: ${r.joinUrl}` : undefined,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gold md:text-4xl">Live Classes</h1>
          {subtitle ? <p className="mt-1 text-muted">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => downloadIcs("dees-classes.ics", upcoming.map(toIcs))}
          className="flex items-center gap-2 self-start text-xs font-bold uppercase tracking-widest text-gold hover:underline focus-gold"
        >
          <Icon name="download" className="text-sm" /> Export calendar
        </button>
      </div>

      {/* Per-batch progress strips */}
      <div className="space-y-3">
        {batches.map((b) => {
          const pct = b.total ? Math.round((b.ended / b.total) * 100) : 0;
          return (
            <div key={b.title} className="rounded-card border border-hairline bg-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">
                  {b.title}
                  {b.trainer ? <span className="font-normal text-muted"> · {b.trainer}</span> : null}
                </span>
                <span className="text-xs font-bold text-gold">
                  Session {b.ended} of {b.total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full bg-cta-gradient" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Next-class banner */}
      {showBanner ? (
        <NextClassHero
          title={banner.title}
          startsAt={banner.startsAt}
          endsAt={banner.endsAt}
          joinUrl={banner.joinUrl}
          topic={banner.topic}
          trainer={banner.trainer}
          dateTime={banner.dateTime}
          serverNow={serverNow}
        />
      ) : null}

      {/* Tabs */}
      <div>
        <div className="mb-6 flex gap-8 border-b border-hairline">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "pb-3 text-lg font-bold capitalize transition-colors focus-gold",
                tab === t ? "border-b-2 border-gold text-gold" : "text-muted hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "upcoming" ? (
          <div className="space-y-3">
            {upcoming.map((r) => {
              const st = computeState(r.startsAt, r.endsAt, null, now);
              const joinable = st === "joinable" || st === "live";
              return (
                <Row key={r.id} r={r}>
                  {joinable ? (
                    <a
                      href={r.joinUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-input bg-cta-gradient px-8 py-3 text-sm font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold"
                    >
                      Join
                    </a>
                  ) : (
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="text-xs font-bold uppercase text-gold">{relativeDay(r.startsAt, tz)}</span>
                      <button
                        type="button"
                        onClick={() => downloadIcs(`${r.title}.ics`, [toIcs(r)])}
                        aria-label="Add to calendar"
                        className="text-muted transition-colors hover:text-gold focus-gold"
                      >
                        <Icon name="calendar_add_on" />
                      </button>
                    </div>
                  )}
                </Row>
              );
            })}
            {upcoming.length === 0 ? (
              <EmptyState text="Your batch schedule is complete — message us on WhatsApp to join the next batch." />
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {past.map((r) => {
              const st = computeState(r.startsAt, r.endsAt, (r.recordingStatus as "ready") ?? null, now);
              return (
                <Row key={r.id} r={r} attendance={r.attendance}>
                  {st === "ready" ? (
                    <Link
                      href="/student/recordings"
                      className="shrink-0 rounded-input border border-gold/40 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gold transition-colors hover:bg-gold/10 focus-gold"
                    >
                      Watch Replay
                    </Link>
                  ) : st === "processing" ? (
                    <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                      <Icon name="progress_activity" className="animate-spin text-sm" /> Processing
                    </span>
                  ) : null}
                </Row>
              );
            })}
            {past.length === 0 ? <EmptyState text="Your past classes will appear here." /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  r,
  attendance,
  children,
}: {
  r: ClassRow;
  attendance?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5 sm:flex-row sm:items-center">
      <div className="min-w-[92px] shrink-0">
        <p className="text-xl font-bold leading-none text-ink">
          {r.badge.month} {r.badge.day}
        </p>
        <p className="text-[11px] tracking-widest text-muted">{r.weekday}</p>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-ink">{r.title}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Icon name="schedule" className="text-sm" /> {r.time}
            {r.duration ? ` · ${r.duration}` : ""}
          </span>
          {r.trainer ? (
            <span className="flex items-center gap-1">
              <Icon name="person" className="text-sm" /> {r.trainer}
            </span>
          ) : null}
          {attendance ? <AttendanceChip status={attendance} /> : null}
        </div>
      </div>
      <div className="flex sm:justify-end">{children}</div>
    </div>
  );
}

function AttendanceChip({ status }: { status: string }) {
  const attended = status === "present" || status === "late";
  const missed = status === "absent";
  const label = attended ? "Attended" : missed ? "Missed" : "Excused";
  const color = attended ? "#22c55e" : missed ? "#ffb4ab" : "#8A93A3";
  return (
    <span
      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      <Icon name={attended ? "check_circle" : missed ? "cancel" : "remove"} className="text-xs" /> {label}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-card border border-hairline bg-surface p-6 text-sm text-muted">{text}</p>;
}
