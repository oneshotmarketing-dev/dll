"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { computeState } from "@/lib/sessionState";

export interface HeroSession {
  title: string;
  startsAt: string;
  endsAt: string | null;
  joinUrl: string | null;
  topic: string | null;
  trainer: string | null;
  dateTime: string; // pre-formatted in the student's timezone
  serverNow: number;
}

function countdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

// The dashboard hero — 2 visible states (build doc §5): countdown (+ Add to
// calendar) → Join Class Now (+ LIVE badge). Ticks client-side so the Join
// button appears the moment the join window opens.
export function NextClassHero(session: HeroSession) {
  const [now, setNow] = useState<number>(session.serverNow);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const state = computeState(session.startsAt, session.endsAt, null, now);
  const live = state === "live";
  const joinable = state === "joinable" || live;
  const remaining = new Date(session.startsAt).getTime() - now;

  return (
    <section className="overflow-hidden rounded-card border border-hairline bg-surface shadow-glow-card">
      <div className="flex flex-col gap-8 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-2">
            {live ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse-dot" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10B981]">Live now</span>
              </>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">● Next live class</span>
            )}
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{session.title}</h3>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Icon name="schedule" className="text-gold" /> {session.dateTime}
            </span>
            {session.trainer ? (
              <span className="flex items-center gap-2">
                <Icon name="account_circle" className="text-gold" /> Trainer: {session.trainer}
              </span>
            ) : null}
          </div>

          {session.topic ? (
            <p className="text-sm text-muted">
              <span className="text-ink/80">Today&apos;s topic:</span> {session.topic}
            </p>
          ) : null}
        </div>

        <div className="shrink-0">
          {joinable ? (
            <a
              href={session.joinUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center rounded-input bg-cta-gradient px-10 py-4 text-sm font-bold uppercase tracking-widest text-canvas shadow-glow-btn transition-transform hover:scale-[1.03] focus-gold"
            >
              Join Class {live ? "Now" : ""}
            </a>
          ) : (
            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="rounded-card border border-gold/30 px-6 py-4 text-center shadow-glow-card">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Starts in</p>
                <p className="mt-1 font-variant-numeric tabular-nums text-2xl font-bold text-ink md:text-3xl">
                  {countdown(remaining)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
