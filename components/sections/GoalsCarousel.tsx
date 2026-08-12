"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { GoalSlide, SectionHeadingContent } from "@/content/types";

// Swipe-first carousel. One full-width slide on mobile (arrows hidden, dots
// visible); up to 3 per view on desktop with arrows. Keyboard + aria wired.
export function GoalsCarousel({
  heading,
  slides,
}: {
  heading: SectionHeadingContent;
  slides: GoalSlide[];
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
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading eyebrow={heading.eyebrow} heading={heading.heading} className="mb-7 lg:mb-12" />

      <div className="relative">
        {/* Spacing uses Embla's padding pattern (NOT flex gap): each slide
            carries its gap as padding-left, cancelled by a negative margin on
            the track. Flex gap breaks on loop wrap-around (no gap between the
            last slide and the looped-back first). Gutter is wider on mobile. */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-8 md:-ml-6">
            {slides.map((slide) => (
              <div
                key={slide.title}
                className="relative min-w-0 pl-8 md:pl-6 flex-[0_0_82%] sm:flex-[0_0_60%] lg:flex-[0_0_33.333%]"
              >
                <article className="relative aspect-[4/5] overflow-hidden rounded-card border border-hairline bg-surface md:aspect-square">
                  {slide.image ? (
                    <Image
                      src={slide.image.src}
                      alt={slide.image.alt}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-surface to-canvas" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 z-10 w-full p-8">
                    <h3 className="mb-3 font-serif text-2xl text-ink md:text-3xl">{slide.title}</h3>
                    <p className="text-ink/80">{slide.body}</p>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
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
    </section>
  );
}
