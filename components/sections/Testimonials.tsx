import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Testimonial, SectionHeadingContent } from "@/content/types";

// Stacked / snap-scroll on mobile, 3-across on desktop. The middle card is
// lightly featured to echo the export.
export function Testimonials({
  heading,
  testimonials,
}: {
  heading: SectionHeadingContent;
  testimonials: Testimonial[];
}) {
  return (
    <section className="w-full border-y border-hairline bg-surface section-y">
      <div className="mx-auto max-w-container-wide px-5 md:px-16">
        <SectionHeading heading={heading.heading} className="mb-7 lg:mb-14" />

        <div className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 md:gap-6 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="relative flex w-[85%] shrink-0 snap-center flex-col gap-6 overflow-hidden rounded-card border border-hairline bg-canvas/50 p-8 md:w-auto"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -right-2 select-none font-serif text-8xl text-gold/5"
              >
                &rdquo;
              </span>
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 font-bold text-gold">
                  {t.name.charAt(0)}
                </span>
                <figcaption>
                  <p className="font-bold text-ink">{t.name}</p>
                  <p className="text-sm text-gold">{t.role}</p>
                </figcaption>
              </div>
              <blockquote className="relative italic text-muted">&ldquo;{t.quote}&rdquo;</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
