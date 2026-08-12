"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { PhoneInput, isValidPhone } from "@/components/admin/PhoneInput";
import type { UserRow, BatchOption } from "@/components/admin/UsersTable";

const inputClass =
  "min-h-[46px] w-full rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

type Dialog = "edit" | "reset" | "deactivate" | null;

// Per-row kebab menu: Edit · Reset password · Deactivate/Reactivate. Admin-only
// endpoints do the work; the reset dialog reveals the new temp password once.
export function UserRowActions({ row, batches = [] }: { row: UserRow; batches?: BatchOption[] }) {
  const router = useRouter();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const inactive = row.status === "inactive";

  // Anchor the menu with fixed positioning off the button's rect so it escapes
  // the table's overflow-x-auto clip.
  function openMenu() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          ref={btnRef}
          type="button"
          onClick={() => (menuPos ? setMenuPos(null) : openMenu())}
          aria-label="Row actions"
          className="flex h-8 w-8 items-center justify-center rounded-input text-muted transition-colors hover:bg-canvas hover:text-gold focus-gold"
        >
          <Icon name="more_vert" className="text-lg" />
        </button>
        {menuPos ? (
          <>
            <button type="button" aria-label="Close menu" className="fixed inset-0 z-[70] cursor-default" onClick={() => setMenuPos(null)} />
            <div
              className="fixed z-[71] w-44 overflow-hidden rounded-input border border-hairline bg-surface py-1 shadow-glow-card"
              style={{ top: menuPos.top, right: menuPos.right }}
            >
              <MenuItem icon="edit" label="Edit" onClick={() => { setMenuPos(null); setDialog("edit"); }} />
              <MenuItem icon="lock_reset" label="Reset password" onClick={() => { setMenuPos(null); setDialog("reset"); }} />
              <MenuItem
                icon={inactive ? "person_add" : "person_off"}
                label={inactive ? "Reactivate" : "Deactivate"}
                onClick={() => { setMenuPos(null); setDialog("deactivate"); }}
                danger={!inactive}
              />
            </div>
          </>
        ) : null}
      </div>

      {dialog === "edit" ? <EditDialog row={row} batches={batches} onClose={() => setDialog(null)} onDone={() => { setDialog(null); router.refresh(); }} /> : null}
      {dialog === "reset" ? <ResetDialog row={row} onClose={() => setDialog(null)} /> : null}
      {dialog === "deactivate" ? (
        <DeactivateDialog row={row} onClose={() => setDialog(null)} onDone={() => { setDialog(null); router.refresh(); }} />
      ) : null}
    </>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-canvas focus-gold ${danger ? "text-[#ffb4ab]" : "text-ink"}`}
    >
      <Icon name={icon} className="text-base" /> {label}
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 w-full max-w-md rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
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

function EditDialog({ row, batches, onClose, onDone }: { row: UserRow; batches: BatchOption[]; onClose: () => void; onDone: () => void }) {
  const [fullName, setFullName] = useState(row.full_name ?? "");
  const [phone, setPhone] = useState(row.phone ?? "");
  const [courseId, setCourseId] = useState(row.course_id ?? "");
  const [batchId, setBatchId] = useState(row.batch_id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Only students carry batches (tutors get an empty list) → enrolment fields
  // appear for students only. Course drives the batch list, same as Add student.
  const showEnrol = batches.length > 0;
  const courses = Array.from(new Map(batches.map((b) => [b.courseId, b.courseTitle])).entries())
    .map(([id, title]) => ({ id, title }));
  const courseBatches = batches.filter((b) => b.courseId === courseId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return setError("Name is required.");
    if (!isValidPhone(phone)) return setError("Enter a valid WhatsApp number.");
    if (showEnrol && (!courseId || !batchId)) return setError("Choose a course and batch.");
    setError(undefined);
    setLoading(true);
    const res = await fetch(`/api/admin/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, ...(showEnrol ? { batchId } : {}) }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Couldn't save.");
    }
    onDone();
  }

  return (
    <Modal title="Edit" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">WhatsApp number</label>
          <PhoneInput value={phone} onChange={setPhone} />
        </div>
        {showEnrol ? (
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
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Batch</label>
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
        ) : null}
        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}

function ResetDialog({ row, onClose }: { row: UserRow; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pw, setPw] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setLoading(true);
    setError(undefined);
    const res = await fetch(`/api/admin/users/${row.id}/reset-password`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(d.error || "Couldn't reset the password.");
    setPw(d.tempPassword);
  }

  function copy() {
    if (!pw) return;
    navigator.clipboard?.writeText(`Dees Language Lounge login\nEmail: ${row.email}\nTemporary password: ${pw}`);
    setCopied(true);
  }

  return (
    <Modal title="Reset password" onClose={onClose}>
      {pw ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">Send this on WhatsApp (individual DM). They&apos;ll set their own password on next login.</p>
          <div className="space-y-2 rounded-input border border-hairline bg-canvas p-4">
            <p className="text-sm text-ink"><span className="text-muted">Email:</span> {row.email}</p>
            <p className="text-sm text-ink"><span className="text-muted">Temp password:</span> <span className="font-mono text-gold">{pw}</span></p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={copy} className="flex-1 rounded-pill border border-gold/50 py-3 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 focus-gold">
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn focus-gold">
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Generate a new temporary password for <span className="text-ink">{row.full_name ?? row.email}</span>. Their current password stops working immediately and they&apos;ll be asked to set a new one on next login.
          </p>
          {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
          <button type="button" onClick={run} disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
            {loading ? "Generating…" : "Generate temp password"}
          </button>
        </div>
      )}
    </Modal>
  );
}

function DeactivateDialog({ row, onClose, onDone }: { row: UserRow; onClose: () => void; onDone: () => void }) {
  const inactive = row.status === "inactive";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function run() {
    setLoading(true);
    setError(undefined);
    const res = await fetch(`/api/admin/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: inactive ? "active" : "inactive" }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setError(d.error || "Couldn't update.");
    }
    onDone();
  }

  return (
    <Modal title={inactive ? "Reactivate account" : "Deactivate account"} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {inactive
            ? <>Restore login access for <span className="text-ink">{row.full_name ?? row.email}</span>?</>
            : <><span className="text-ink">{row.full_name ?? row.email}</span> will be unable to log in. Their data (enrollments, attendance) is preserved and access can be restored anytime.</>}
        </p>
        {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className={`w-full rounded-pill py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60 focus-gold ${inactive ? "bg-cta-gradient text-canvas shadow-glow-btn" : "border border-[#ffb4ab]/50 text-[#ffb4ab] hover:bg-[#ffb4ab]/10"}`}
        >
          {loading ? "Working…" : inactive ? "Reactivate" : "Deactivate"}
        </button>
      </div>
    </Modal>
  );
}
