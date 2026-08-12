"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { PromoBarContent } from "@/content/types";

const STORAGE_PREFIX = "dll-promo-dismissed:";

/**
 * Dismissible, content-driven promo strip. Persists dismissal in localStorage
 * keyed by content id — bump the id in /content to re-show after a change.
 * Single line; shorter copy on mobile; dismiss always tappable (≥44px).
 */
export function PromoBar({ content }: { content: PromoBarContent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_PREFIX + content.id) === "1";
    setVisible(!dismissed);
  }, [content.id]);

  if (!visible) return null;

  return (
    <div className="relative z-[60] border-b border-gold/10 bg-surface text-gold">
      <div className="mx-auto flex min-h-[36px] max-w-container-wide items-center justify-center gap-3 px-10 py-1.5 text-center">
        <p className="text-eyebrow uppercase tracking-widest">
          <span className="hidden sm:inline">{content.text}</span>
          <span className="sm:hidden">{content.mobileText ?? content.text}</span>
        </p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            window.localStorage.setItem(STORAGE_PREFIX + content.id, "1");
            setVisible(false);
          }}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-icon text-gold/70 hover:text-gold focus-gold"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      </div>
    </div>
  );
}
