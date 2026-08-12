import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { ExamsContent, ExamCard } from "@/content/types";

/**
 * "The Exams" — which French tests IRCC accepts. Two "accept" cards (gold
 * check, the exams we prep) and one muted "reject" card (periwinkle cross list
 * of what does NOT count). 1 col mobile / 3 across desktop.
 */
export function ExamsSection({ content }: { content: ExamsContent }) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading eyebrow={content.eyebrow} heading={content.heading} className="mb-6" />
      <p className="mx-auto mb-7 lg:mb-12 max-w-3xl text-center text-lg text-muted">{content.intro}</p>

      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
        {content.cards.map((card) => (
          <ExamCardView key={card.title} card={card} />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6 text-center">
        <p className="max-w-3xl text-muted">{content.closing}</p>
        <CTAButton label={content.closingCtaLabel} context="TEF vs TCF Canada" waMessage={content.closingWaMessage} />
      </div>
    </section>
  );
}

function ExamCardView({ card }: { card: ExamCard }) {
  const accept = card.variant === "accept";
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-card bg-surface p-8",
        accept ? "border border-gold/40" : "border border-hairline",
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            accept ? "bg-gold/15 text-gold" : "bg-periwinkle/15 text-periwinkle",
          )}
        >
          <Icon name={accept ? "check" : "close"} className="text-[20px]" />
        </span>
        <h3 className={cn("text-xl font-bold", accept ? "text-ink" : "text-periwinkle")}>{card.title}</h3>
      </div>

      {/* One row per bullet — gold ✓ (accept) / periwinkle ✗ (reject) marker,
          bold white label, muted remainder. The closing "We prepare you for
          this exam" bullet is emphasized (gold marker + white bold). */}
      <ul className="space-y-4">
        {card.bullets.map((b) =>
          b.emphasis ? (
            <li key={b.label} className="mt-1 flex items-start gap-3">
              <Icon name="check" filled className="mt-0.5 shrink-0 text-[18px] text-gold" />
              <span className="font-semibold text-ink">{b.label}</span>
            </li>
          ) : (
            <li key={b.label} className="flex items-start gap-3">
              <Icon
                name={accept ? "check" : "close"}
                className={cn("mt-0.5 shrink-0 text-[18px]", accept ? "text-gold" : "text-periwinkle")}
              />
              <span className="text-muted">
                <span className="font-semibold text-ink">{b.label}</span>
                {b.text ? (accept ? <> {b.text}</> : <> — {b.text}</>) : null}
              </span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
