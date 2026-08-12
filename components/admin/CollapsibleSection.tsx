"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

// A collapsible card that matches the session rows: a clickable header with a
// title + a right-side count badge + chevron, revealing its children on expand.
// Used to fold the batch roster into a dropdown that shows the student count
// when closed.
export function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-canvas/40 focus-gold"
      >
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <div className="flex items-center gap-2.5">
          {badge ? (
            <span className="rounded-pill bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">{badge}</span>
          ) : null}
          <Icon name={open ? "expand_less" : "expand_more"} className="text-lg text-muted" />
        </div>
      </button>
      {open ? <div className="border-t border-hairline bg-canvas p-4">{children}</div> : null}
    </div>
  );
}
