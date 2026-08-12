import { CTAButton } from "@/components/ui/CTAButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Batch } from "@/content/types";

// Single batch card. The featured card carries the gold glow + "Most Popular"
// ribbon; its CTA routes to /book-assessment?batch=… (assessment-first, never
// "Join now" — protects the one-CTA rule).
export function BatchCard({ batch, ctaLabel }: { batch: Batch; ctaLabel: string }) {
  const rows = [
    { icon: "calendar_today", text: batch.dates },
    { icon: "schedule", text: batch.schedule },
    batch.level ? { icon: "trending_up", text: batch.level } : null,
    { icon: "person", text: `Faculty: ${batch.faculty}` },
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-card bg-surface p-8",
        batch.featured
          ? "border border-gold shadow-glow-card lg:-mt-3 lg:mb-3"
          : "border border-hairline",
      )}
    >
      {batch.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-cta-gradient px-4 py-1 text-eyebrow uppercase tracking-widest text-canvas shadow-lg">
          Most Popular
        </span>
      ) : null}

      <div className="flex-grow">
        <div className="mb-3 flex items-start justify-between gap-3 pt-2">
          <h3 className="text-lg font-bold text-ink">{batch.title}</h3>
        </div>

        {batch.covered ? <p className="mb-4 text-sm text-gold">{batch.covered}</p> : null}

        <div className="mb-6 space-y-2">
          {rows.map((row) => (
            <p key={row.text} className="flex items-center gap-2 text-sm text-muted">
              <Icon name={row.icon} className="text-[16px] text-gold/70" />
              {row.text}
            </p>
          ))}
        </div>

        <span className="mb-6 inline-block rounded-pill bg-gold/10 px-3 py-1 text-eyebrow uppercase text-gold">
          {batch.seatsLeft}
        </span>
      </div>

      <CTAButton
        label={ctaLabel}
        size="md"
        fullWidth
        variant={batch.featured ? "primary" : "outlined"}
        context={`batch: ${batch.title}`}
        batch={batch.title}
        lang={batch.language}
      />
    </div>
  );
}
