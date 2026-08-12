"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Icon } from "@/components/ui/Icon";

const inputClass =
  "min-h-[46px] w-full rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold";

export function AddBatchButton({
  courses,
  tutors,
}: {
  courses: { id: string; title: string }[];
  tutors: { id: string; full_name: string | null }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [tutorId, setTutorId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [schedule, setSchedule] = useState("");
  const [seats, setSeats] = useState("20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function reset() {
    setOpen(false);
    setTitle("");
    setStartDate("");
    setSchedule("");
    setError(undefined);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId || !title.trim()) {
      setError("Pick a course and enter a title.");
      return;
    }
    setError(undefined);
    setLoading(true);
    const { error: err } = await createClient().from("batches").insert({
      course_id: courseId,
      tutor_id: tutorId || null,
      title: title.trim(),
      start_date: startDate || null,
      schedule_text: schedule || null,
      seats_total: seats ? Number(seats) : null,
      status: "open",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    reset();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={courses.length === 0}
        className="rounded-pill bg-cta-gradient px-6 py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn transition-transform hover:scale-[1.02] disabled:opacity-50 focus-gold"
      >
        Create batch
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={reset} className="absolute inset-0 bg-black/70" />
          <form onSubmit={submit} className="relative z-10 w-full max-w-md space-y-4 rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Create batch</h3>
              <button type="button" onClick={reset} aria-label="Close" className="text-muted hover:text-gold focus-gold">
                <Icon name="close" />
              </button>
            </div>
            <div>
              <label className={labelClass}>Course</label>
              <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required className={inputClass}>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tutor</label>
              <select value={tutorId} onChange={(e) => setTutorId(e.target.value)} className={inputClass}>
                <option value="">— Unassigned —</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name ?? "Tutor"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Batch title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="TEF Canada Beginners — Batch 13" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Seats</label>
                <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Schedule</label>
              <input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Tue & Thu 7–9 PM EST" className={inputClass} />
            </div>
            {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
              {loading ? "Creating…" : "Create batch"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
