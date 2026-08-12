import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { CurriculumCard, SectionHeadingContent } from "@/content/types";

// Two layouts from one component:
//  - "grid"  → compact flag cards, 1/2/4 columns (home).
//  - "detail"→ larger list cards with a footnote, 1/2 columns (french-canada).
export function Curriculum({
  heading,
  intro,
  cards,
  closing,
  variant = "grid",
}: {
  heading: SectionHeadingContent;
  intro?: string;
  cards: CurriculumCard[];
  closing?: string;
  variant?: "grid" | "detail";
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} eyebrow={heading.eyebrow} className={intro ? "mb-6" : "mb-7 lg:mb-12"} />
      {intro ? <p className="mx-auto mb-7 lg:mb-12 max-w-3xl text-center text-lg text-muted">{intro}</p> : null}

      <div
        className={cn(
          "mb-10 grid gap-4 md:gap-6",
          variant === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2",
        )}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            className={cn(
              "rounded-card border border-hairline bg-surface transition-colors hover:border-gold/30",
              variant === "grid" ? "p-8" : "flex flex-col gap-6 p-8 md:p-10",
            )}
          >
            <h3 className="text-xl font-bold text-ink">
              {card.flag ? <span className="mr-2">{card.flag}</span> : null}
              {card.title}
            </h3>

            {variant === "grid" ? (
              <p className="mt-3 text-muted">{card.lines.join(" ")}</p>
            ) : (
              <ul className="flex flex-grow flex-col gap-4">
                {card.lines.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-muted">
                    <Icon name="check" className="mt-0.5 shrink-0 text-gold" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )}

            {card.footnote ? (
              <p className="mt-2 border-t border-hairline pt-5 font-bold text-gold">{card.footnote}</p>
            ) : null}
          </div>
        ))}
      </div>

      {closing ? <p className="text-center text-muted">{closing}</p> : null}
    </section>
  );
}
