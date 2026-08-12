import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { Chip } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import type { StakesContent } from "@/content/types";

/**
 * "The Stakes" — the two draw queues on ONE shared CRS scale. Longer bar =
 * higher required score = harder. The general draw is the muted, LOCKED
 * periwinkle bar (~95%); the French draw is the gold, glowing OPEN bar (~72%).
 * A "YOU" marker sits at ~82% (a typical stuck ~CRS 450, linearly between the
 * two cut-offs) — past the open French door, short of the closed general one.
 *
 * Widths are hand-tuned design values (not derived from content.*.amount), so
 * this is a component-only change; the content file is untouched.
 */
const GENERAL_W = 95;
const FRENCH_W = 72;
const YOU_W = 82;
const YOU_LABEL = "You · CRS ~450";

export function StakesSection({ content }: { content: StakesContent }) {
  return (
    <section className="mx-auto max-w-container px-5 section-y md:px-16">
      <SectionHeading eyebrow={content.eyebrow} heading={content.heading} className="mb-7 lg:mb-12" />

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Comparison chart: both bars on one shared scale + a YOU marker. */}
        <div className="rounded-card border border-hairline bg-surface p-5 md:p-6">
          {/* General row — muted, locked */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-periwinkle">
                <Icon name="lock" className="text-[18px]" />
                {content.general.label}
              </span>
              <div className="flex items-center gap-3">
                <Chip tone="neutral">Closed to most</Chip>
                <span className="text-lg font-bold text-periwinkle">{content.general.value}</span>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-pill bg-white/5">
              <div className="h-full rounded-pill bg-periwinkle/40" style={{ width: `${GENERAL_W}%` }} />
            </div>
          </div>

          {/* YOU marker between the rows, aligned to ~450 on the shared scale. */}
          <div className="relative h-12" aria-hidden="true">
            <div
              className="absolute bottom-0 top-0 flex flex-col items-center"
              style={{ left: `${YOU_W}%`, transform: "translateX(-50%)" }}
            >
              <span className="w-0 flex-1 border-l border-dashed border-gold/70" />
              <span className="my-1 whitespace-nowrap rounded-pill border border-gold bg-canvas px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold shadow-glow-btn">
                {YOU_LABEL}
              </span>
              <span className="w-0 flex-1 border-l border-dashed border-gold/70" />
            </div>
          </div>

          {/* French row — gold, open */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-gold">
                <Icon name="lock_open" className="text-[18px]" />
                {content.french.label}
              </span>
              <div className="flex items-center gap-3">
                <Chip tone="gold">Open at your level</Chip>
                <span className="text-lg font-bold text-gold">{content.french.value}</span>
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-pill bg-white/5">
              <div className="h-full rounded-pill bg-cta-gradient shadow-glow-btn" style={{ width: `${FRENCH_W}%` }} />
            </div>
          </div>

          {/* Axis: longer bar = higher required score = harder. */}
          <p className="mt-4 text-right text-[11px] uppercase tracking-widest text-muted">
            CRS score required →
          </p>
        </div>

        <p className="pt-4 text-center text-muted md:text-left">{content.caption}</p>

        <div className="flex flex-col items-center gap-5 rounded-card border border-hairline bg-surface/60 p-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-ink">{content.subline}</p>
          <div className="shrink-0">
            <CTAButton label={content.ctaLabel} size="md" context="the French draw" waMessage={content.waMessage} />
          </div>
        </div>
      </div>
    </section>
  );
}
