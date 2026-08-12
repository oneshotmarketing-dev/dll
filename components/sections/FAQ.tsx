"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import type { FaqItem, SectionHeadingContent } from "@/content/types";

// Accessible accordion: first item open by default, gold +/− toggle, one open
// at a time, keyboard-operable (native <button> + aria-expanded + region).
export function FAQ({
  heading,
  items,
}: {
  heading: SectionHeadingContent;
  items: FaqItem[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-4xl px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} className="mb-7 lg:mb-14" />

      <div className="space-y-4">
        {items.map((item, i) => {
          const isOpen = open === i;
          const panelId = `faq-panel-${i}`;
          const btnId = `faq-btn-${i}`;
          return (
            <div
              key={item.question}
              className={cn(
                "overflow-hidden rounded-card border bg-surface transition-colors",
                isOpen ? "border-gold/40" : "border-hairline",
              )}
            >
              <h3>
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left focus-gold"
                >
                  <span className="text-lg font-bold text-ink">{item.question}</span>
                  <span className="shrink-0 text-2xl leading-none text-gold" aria-hidden="true">
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
                className="px-6 pb-6 text-muted"
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
