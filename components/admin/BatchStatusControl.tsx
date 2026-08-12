"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// Mark a batch completed (flips its active enrollments to completed) or reopen it.
export function BatchStatusControl({ batchId, status }: { batchId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const completed = status === "completed";

  async function setStatus(next: string) {
    setBusy(true);
    setError(undefined);
    const res = await fetch(`/api/admin/batches/${batchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    setConfirm(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Couldn't update the batch.");
      return;
    }
    router.refresh();
  }

  if (completed) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setStatus("running")}
          disabled={busy}
          className="rounded-input border border-gold/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 disabled:opacity-60 focus-gold"
        >
          {busy ? "Reopening…" : "Reopen batch"}
        </button>
        {error ? <p className="text-xs" style={{ color: "#ffb4ab" }}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {confirm ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Flip active enrollments to completed?</span>
          <button
            type="button"
            onClick={() => setStatus("completed")}
            disabled={busy}
            className="rounded-input bg-cta-gradient px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold"
          >
            {busy ? "Saving…" : "Confirm"}
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="text-xs font-bold text-muted hover:text-ink focus-gold">
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex items-center gap-1.5 rounded-input border border-hairline px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted transition-colors hover:border-gold hover:text-gold focus-gold"
        >
          <Icon name="check_circle" className="text-sm" /> Mark completed
        </button>
      )}
      {error ? <p className="text-xs" style={{ color: "#ffb4ab" }}>{error}</p> : null}
    </div>
  );
}
