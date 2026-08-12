"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput, isValidPhone } from "@/components/admin/PhoneInput";

const inputClass =
  "min-h-[46px] w-full rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

// Admin action: create a student/tutor. On success it reveals the one-time temp
// password to copy + DM (build doc §10). The new user is forced to reset it.
// Students are enrolled into the chosen batch on create.
export function AddUserButton({
  role,
  label,
  batches = [],
}: {
  role: "student" | "tutor";
  label: string;
  batches?: { id: string; title: string; courseId: string; courseTitle: string }[];
}) {
  const router = useRouter();
  const isStudent = role === "student";
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");

  // Distinct courses that have at least one open/running batch, plus the batches
  // for the currently selected course (a batch belongs to exactly one course).
  const courses = Array.from(new Map(batches.map((b) => [b.courseId, b.courseTitle])).entries())
    .map(([id, title]) => ({ id, title }));
  const courseBatches = batches.filter((b) => b.courseId === courseId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setOpen(false);
    setEmail("");
    setFullName("");
    setPhone("");
    setCourseId("");
    setBatchId("");
    setError(undefined);
    setCreated(null);
    setCopied(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhone(phone)) return setError("Enter a valid WhatsApp number.");
    if (isStudent && batches.length > 0 && (!courseId || !batchId)) return setError("Choose a course and batch to enrol the student in.");
    setError(undefined);
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, phone, role, batchId: isStudent ? batchId || null : null }),
    });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(d.error === "invalid_input" ? "Please fill name and a valid email." : d.error || "Couldn't create the account.");
      return;
    }
    setCreated({ email: d.email, tempPassword: d.tempPassword });
    router.refresh();
  }

  function copy() {
    if (!created) return;
    navigator.clipboard?.writeText(
      `Dees Language Lounge login\nEmail: ${created.email}\nTemporary password: ${created.tempPassword}`,
    );
    setCopied(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-pill bg-cta-gradient px-6 py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn transition-transform hover:scale-[1.02] focus-gold"
      >
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={reset} className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 w-full max-w-md rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
            {created ? (
              <div className="space-y-5 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Icon name="check_circle" className="text-4xl" filled />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-ink">Account created</h3>
                  <p className="mt-1 text-sm text-muted">
                    Send these on WhatsApp (individual DM). They&apos;ll set their own password on first login.
                  </p>
                </div>
                <div className="space-y-2 rounded-input border border-hairline bg-canvas p-4 text-left">
                  <p className="text-sm text-ink">
                    <span className="text-muted">Email:</span> {created.email}
                  </p>
                  <p className="text-sm text-ink">
                    <span className="text-muted">Temp password:</span>{" "}
                    <span className="font-mono text-gold">{created.tempPassword}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={copy} className="flex-1 rounded-pill border border-gold/50 py-3 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 focus-gold">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                  <button type="button" onClick={reset} className="flex-1 rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-ink">{label}</h3>
                  <button type="button" onClick={reset} aria-label="Close" className="text-muted hover:text-gold focus-gold">
                    <Icon name="close" />
                  </button>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="name@email.com" className={inputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">WhatsApp number (optional)</label>
                  <PhoneInput value={phone} onChange={setPhone} />
                </div>
                {isStudent ? (
                  batches.length === 0 ? (
                    <p className="rounded-input border border-hairline bg-canvas px-4 py-3 text-xs text-muted">
                      No open batches yet — create one first, then enrol from the batch page.
                    </p>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Course</label>
                        <select
                          value={courseId}
                          onChange={(e) => { setCourseId(e.target.value); setBatchId(""); }}
                          required
                          className={inputClass}
                        >
                          <option value="">— Select a course —</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Enrol in batch</label>
                        <select
                          value={batchId}
                          onChange={(e) => setBatchId(e.target.value)}
                          required
                          disabled={!courseId}
                          className={`${inputClass} disabled:opacity-50`}
                        >
                          <option value="">{courseId ? "— Select a batch —" : "Select a course first"}</option>
                          {courseBatches.map((b) => (
                            <option key={b.id} value={b.id}>{b.title}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )
                ) : null}
                {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
                <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
                  {loading ? "Creating…" : "Create account"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
