"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabaseClient";
import { tzOptionLabel } from "@/lib/datetime";

function tzList(): string[] {
  const sv = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf;
  return sv ? sv("timeZone") : ["America/Toronto", "America/New_York", "Asia/Kolkata", "Europe/London", "UTC"];
}

function browserTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// Shared, searchable timezone picker used by the top-bar chip across all roles.
// Writes profiles.timezone for the current user, then refreshes so every
// server-rendered time re-renders in the new zone.
export function TimezoneDialog({
  userId,
  currentTz,
  onClose,
}: {
  userId: string;
  currentTz: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const zones = useMemo(tzList, []);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(currentTz || browserTz());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? zones.filter((z) => z.toLowerCase().includes(q) || tzOptionLabel(z).toLowerCase().includes(q))
      : zones;
    return list.slice(0, 200);
  }, [query, zones]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(undefined);
    const { error: err } = await createClient().from("profiles").update({ timezone: selected }).eq("id", userId);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col rounded-card border border-hairline bg-surface p-6 shadow-glow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink">Your timezone</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-gold focus-gold">
            <Icon name="close" />
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">All class times across the portal are shown in this timezone.</p>

        <div className="relative mb-3">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <Icon name="search" className="text-lg" />
          </span>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or region — Toronto, Mumbai…"
            className="min-h-[46px] w-full rounded-input border border-hairline bg-canvas pl-10 pr-4 text-ink placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-input border border-hairline bg-canvas p-1">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">No timezones match “{query}”.</p>
          ) : (
            filtered.map((z) => {
              const active = z === selected;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => setSelected(z)}
                  className={`flex w-full items-center justify-between gap-3 rounded-input px-3 py-2 text-left text-sm transition-colors focus-gold ${active ? "bg-gold text-canvas" : "text-ink hover:bg-white/5"}`}
                >
                  <span className="font-medium">{tzOptionLabel(z)}</span>
                  <span className={`text-[11px] ${active ? "text-canvas/70" : "text-muted"}`}>{z.replace(/_/g, " ")}</span>
                </button>
              );
            })
          )}
        </div>

        {error ? <p className="mt-3 text-sm" style={{ color: "#ffb4ab" }}>{error}</p> : null}

        <div className="mt-4 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-pill border border-hairline px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-muted hover:text-ink focus-gold">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || !selected}
            className="rounded-pill bg-cta-gradient px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-canvas shadow-glow-btn disabled:opacity-60 focus-gold"
          >
            {saving ? "Saving…" : "Save timezone"}
          </button>
        </div>
      </div>
    </div>
  );
}
