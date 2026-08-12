"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Testimonial, SectionHeadingContent } from "@/content/types";

/**
 * TestimonialsV2 — editorial quote cards in an Embla slider (same control
 * pattern as GoalsCarouselV3: arrows + dots). 1 card/view mobile, 2 tablet,
 * 3 desktop. Header is text-only: student name (bold) above a gold credential
 * line with a verified badge — no avatar image. Card surface + quote styling
 * unchanged. Used on the homepage and /french-canada.
 */
export function TestimonialsV2({
  heading,
  testimonials,
}: {
  heading: SectionHeadingContent;
  testimonials: Testimonial[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full border-y border-hairline bg-surface section-y">
      <div className="mx-auto max-w-container-wide px-5 md:px-16">
        <SectionHeading heading={heading.heading} className="mb-7 lg:mb-14" />

        <div className="relative">
          {/* Embla viewport. Slides carry their gap as padding-left (loop-safe). */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex items-stretch -ml-4 md:-ml-6">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="min-w-0 pl-4 md:pl-6 flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <figure className="relative flex h-full flex-col gap-6 overflow-hidden rounded-card border border-hairline bg-canvas/50 p-8">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-6 -right-2 select-none font-serif text-8xl text-gold/5"
                    >
                      &rdquo;
                    </span>

                    <figcaption>
                      <p className="font-bold text-ink">{t.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-gold">
                        <Icon name="verified" className="text-[15px]" filled />
                        {t.role}
                      </p>
                    </figcaption>

                    <blockquote className="relative italic text-muted">&ldquo;{t.quote}&rdquo;</blockquote>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          {/* Controls — arrows (desktop) + dots. */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => emblaApi?.scrollPrev()}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink/60 transition-colors hover:border-gold hover:text-gold focus-gold md:flex"
            >
              <Icon name="chevron_left" />
            </button>

            <div className="flex gap-2">
              {snaps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === selected}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === selected ? "w-6 bg-gold" : "w-2 bg-white/20",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Next slide"
              onClick={() => emblaApi?.scrollNext()}
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink/60 transition-colors hover:border-gold hover:text-gold focus-gold md:flex"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
