"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { GoalSlide, SectionHeadingContent } from "@/content/types";

// V3 — split card (image on top, text panel below) replacing the V1
// text-overlaid-on-image treatment. Swipe-first: one card on mobile (arrows
// hidden, dots visible), up to 3 per view on desktop. Card heights are
// equalized via items-stretch so the text panels line up across slides.
export function GoalsCarouselV3({
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
            the track — loop-safe (flex gap collapses at the wrap-around).
            items-stretch lets the shorter text panels grow to match the
            tallest card so the three heights line up. */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-stretch -ml-6">
            {slides.map((slide) => (
              <div
                key={slide.title}
                className="min-w-0 pl-6 flex-[0_0_88%] sm:flex-[0_0_58%] lg:flex-[0_0_33.333%]"
              >
                {/* Card capped on mobile so a full card + a peek of the next
                    fits the viewport; uncapped from sm up. */}
                <article className="mx-auto flex h-full max-w-[340px] flex-col overflow-hidden rounded-2xl border border-hairline bg-surface sm:max-w-none">
                  {/* TOP — square image, rounded top corners via the card clip.
                      Warm tint + slight desaturation, plus a soft ~15% bottom
                      fade so the image meets the panel gently. */}
                  <div className="relative aspect-square w-full shrink-0">
                    {slide.image ? (
                      <Image
                        src={slide.image.src}
                        alt={slide.image.alt}
                        fill
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 58vw, 33vw"
                        className="object-cover"
                        style={{
                          objectPosition: slide.imagePosition ?? "center top",
                          filter: "saturate(0.9) sepia(0.12)",
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-surface to-canvas" />
                    )}
                    {/* Warm gold tint */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gold/10 mix-blend-overlay"
                    />
                    {/* Soft bottom fade into the text panel (surface = #0B1220) */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[15%] bg-gradient-to-t from-surface to-transparent"
                    />
                  </div>

                  {/* BOTTOM — text panel on the card surface. */}
                  <div className="flex flex-1 flex-col p-6">
                    <span aria-hidden="true" className="mb-4 block h-[2px] w-8 bg-gold" />
                    <h3 className="mb-3 font-serif text-[24px] leading-tight text-ink">
                      {slide.title}
                    </h3>
                    <p className="leading-relaxed text-muted">{slide.body}</p>
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
