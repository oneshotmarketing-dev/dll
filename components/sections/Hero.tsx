"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AccentTitle } from "@/components/ui/SectionHeading";
import { PillBadge } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import { GlowContainer } from "@/components/ui/GlowContainer";
import { resolveCta } from "@/lib/cta";
import { cn } from "@/lib/cn";
import type { HeroContent } from "@/content/types";

// Hero: 7/5 split at lg+, stacked on mobile. The language/goal picker updates
// the primary CTA destination (form mode → /book-assessment?lang= / ?goal=).
export function Hero({
  content,
  contextLabel,
}: {
  content: HeroContent;
  contextLabel: string;
}) {
  const first = content.picker?.options[0]?.value ?? "";
  const [selected, setSelected] = useState<string>(String(first));

  const ctaParam =
    content.picker?.kind === "goal" ? { goal: selected } : { lang: selected };
  const selectedLabel =
    content.picker?.options.find((o) => String(o.value) === selected)?.label ?? "";
  // WhatsApp-mode prefill: a static content-provided message wins (picker-less
  // heroes); otherwise reflect the picker choice.
  const waMessage =
    content.ctaWaMessage ??
    (content.picker?.kind === "goal"
      ? `Hi! I'd like to know more about French for ${selectedLabel}.`
      : `Hi! I want to learn ${selectedLabel}. Can you share batch details and fees?`);
  const { href, external } = resolveCta({ context: contextLabel, waMessage, ...ctaParam });

  return (
    <GlowContainer className="mx-auto max-w-container-wide px-5 pb-20 pt-16 md:px-16 md:pb-24 md:pt-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="z-10 space-y-8 lg:col-span-7">
          {content.eyebrow ? <PillBadge>{content.eyebrow}</PillBadge> : null}

          <AccentTitle
            as="h1"
            heading={content.heading}
            serifWhole={content.headingSerifWhole}
            accentStyle="gradient"
            className="text-[clamp(2.5rem,8vw,4.5rem)] leading-[1.05]"
          />

          <p className="max-w-xl text-lg leading-relaxed text-muted">{content.subhead}</p>

          <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
            {content.picker ? (
              <div className="relative w-full sm:w-72">
                <label htmlFor="hero-picker" className="sr-only">
                  {content.picker.label}
                </label>
                <select
                  id="hero-picker"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="min-h-[52px] w-full appearance-none rounded-input border border-hairline bg-surface px-4 py-3 pr-10 text-sm font-bold uppercase tracking-widest text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {content.picker.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {content.picker!.label}: {opt.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold"
                />
              </div>
            ) : null}

            {external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-pill bg-cta-gradient px-10 py-4 text-sm font-semibold uppercase tracking-widest text-canvas shadow-glow-btn glow-btn-responsive transition-all hover:scale-[1.03] hover:shadow-glow-btn-hover focus-gold"
              >
                {content.ctaLabel}
              </a>
            ) : (
              <Link
                href={href}
                className="inline-flex min-h-[52px] items-center justify-center rounded-pill bg-cta-gradient px-10 py-4 text-sm font-semibold uppercase tracking-widest text-canvas shadow-glow-btn glow-btn-responsive transition-all hover:scale-[1.03] hover:shadow-glow-btn-hover focus-gold"
              >
                {content.ctaLabel}
              </Link>
            )}
          </div>

          {content.underCtaLine ? (
            <p className="text-sm text-muted">{content.underCtaLine}</p>
          ) : null}

          {content.credibilityLine ? (
            <div className="flex items-center gap-3 pt-2">
              <Icon name="verified" className="text-gold" />
              <p className="text-muted">{content.credibilityLine}</p>
            </div>
          ) : null}
        </div>

        {/* Image + live overlay card */}
        <div className="relative mt-4 lg:col-span-5 lg:mt-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-56 w-56 rounded-full bg-gold/20 blur-[90px]"
          />
          <div className="relative rotate-2 transition-transform duration-700 hover:rotate-0">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              width={640}
              height={640}
              priority
              className="aspect-square w-full rounded-card border-4 border-gold/30 object-cover shadow-2xl"
            />
            {content.liveCard ? (
              <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-card border border-gold bg-surface/90 p-4 shadow-2xl backdrop-blur-lg sm:-left-8">
                <span
                  className={cn("h-3 w-3 shrink-0 rounded-full bg-[#10B981] animate-pulse-dot")}
                  style={{ boxShadow: "0 0 12px #10B981" }}
                />
                <div>
                  <p className="text-eyebrow uppercase tracking-widest text-gold">
                    {content.liveCard.label}
                  </p>
                  <p className="text-sm text-muted">{content.liveCard.participants}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </GlowContainer>
  );
}
