"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const inputClass =
  "min-h-[46px] w-full rounded-input border border-hairline bg-canvas px-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

export function AddCourseButton({ languages }: { languages: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [languageId, setLanguageId] = useState(languages[0]?.id ?? "");
  const [level, setLevel] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function reset() {
    setOpen(false);
    setTitle("");
    setLevel("");
    setError(undefined);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ languageId, level: level || null, title }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Couldn't create the course.");
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
        className="rounded-pill bg-cta-gradient px-6 py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn transition-transform hover:scale-[1.02] focus-gold"
      >
        Add course
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={reset} className="absolute inset-0 bg-black/70" />
          <form onSubmit={submit} className="relative z-10 w-full max-w-md space-y-4 rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Add course</h3>
              <button type="button" onClick={reset} aria-label="Close" className="text-muted hover:text-gold focus-gold">
                <Icon name="close" />
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Language</label>
              <select value={languageId} onChange={(e) => setLanguageId(e.target.value)} required className={inputClass}>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Level (optional)</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gold">Course title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="TEF Canada Beginners" className={inputClass} />
            </div>
            {error ? <p className="text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full rounded-pill bg-cta-gradient py-3 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold">
              {loading ? "Creating…" : "Create course"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
