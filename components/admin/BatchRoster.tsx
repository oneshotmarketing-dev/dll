"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { Icon } from "@/components/ui/Icon";

export interface RosterRow {
  enrollmentId: string;
  studentId: string;
  fullName: string | null;
  email: string | null;
}

export function BatchRoster({
  batchId,
  courseId,
  roster,
  available,
  canManage = true,
}: {
  batchId: string;
  courseId: string;
  roster: RosterRow[];
  available: { id: string; full_name: string | null }[];
  // Tutors see a read-only, name-only roster (no enrol/remove, no student PII).
  canManage?: boolean;
}) {
  const router = useRouter();
  const [sel, setSel] = useState(available[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function enrol() {
    if (!sel) return;
    setBusy(true);
    setError(undefined);
    // Upsert on (student_id, course_id): a repeater whose previous enrollment in
    // this course is 'completed' already has a row (unique constraint), so we flip
    // it back to active on the new batch rather than inserting a duplicate.
    const { error: err } = await createClient()
      .from("enrollments")
      .upsert(
        { student_id: sel, course_id: courseId, batch_id: batchId, mode: "live", status: "active" },
        { onConflict: "student_id,course_id" },
      );
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
  }

  async function remove(enrollmentId: string) {
    setBusy(true);
    await createClient().from("enrollments").delete().eq("id", enrollmentId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Enrol row — admin only */}
      {canManage ? (
        <>
          <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 sm:flex-row sm:items-center">
            <select
              value={sel}
              onChange={(e) => setSel(e.target.value)}
              disabled={available.length === 0}
              className="min-h-[44px] flex-1 rounded-input border border-hairline bg-canvas px-4 text-sm text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              aria-label="Student to enrol"
            >
              {available.length === 0 ? (
                <option value="">No students left to enrol</option>
              ) : (
                available.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name ?? "Student"}</option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={enrol}
              disabled={busy || available.length === 0}
              className="rounded-pill bg-cta-gradient px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-50 focus-gold"
            >
              Enrol student
            </button>
          </div>
          {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
        </>
      ) : null}

      {/* Roster */}
      {roster.length === 0 ? (
        <p className="rounded-card border border-hairline bg-surface p-6 text-center text-sm text-muted">
          No students enrolled yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
          <table className="w-full min-w-[320px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-widest text-muted">
                <th className="px-4 py-3 font-bold">Student</th>
                {canManage ? <th className="px-4 py-3 font-bold">Email</th> : null}
                {canManage ? <th className="px-4 py-3"></th> : null}
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => (
                <tr key={r.enrollmentId} className="border-b border-hairline/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{r.fullName ?? "—"}</td>
                  {canManage ? <td className="px-4 py-3 text-muted">{r.email ?? "—"}</td> : null}
                  {canManage ? (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(r.enrollmentId)}
                        disabled={busy}
                        className="text-xs font-bold text-muted transition-colors hover:text-[#ffb4ab] focus-gold"
                        aria-label={`Remove ${r.fullName ?? "student"}`}
                      >
                        <Icon name="person_remove" className="text-base" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
