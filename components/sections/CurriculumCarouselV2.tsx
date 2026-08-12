"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { CurriculumSlide, SectionHeadingContent } from "@/content/types";

/**
 * CurriculumCarouselV2 — same Embla mechanics as the Goals carousel (arrows +
 * dots + swipe, padding-based spacing that survives loop wrap-around), but with
 * NO background images: clean #0B1220 surface slides, one language each. Slide
 * title is bold sans with the language name as the gold serif accent.
 */
export function CurriculumCarouselV2({
  heading,
  slides,
  closing,
  closingCtaLabel,
  closingWaMessage,
}: {
  heading: SectionHeadingContent;
  slides: CurriculumSlide[];
  closing?: string;
  closingCtaLabel: string;
  closingWaMessage?: string;
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
        <div className="overflow-hidden" ref={emblaRef}>
          {/* Gap rides on each slide as padding (loop-safe), like GoalsCarousel.
              items-stretch (default) makes every slide fill the flex row's height
              = the tallest slide, so slides stay equal height and the dots/arrows
              below never jump between slides of different content length. */}
          <div className="flex items-stretch -ml-8 md:-ml-6">
            {slides.map((slide) => (
              <div
                key={slide.name}
                className="relative flex min-w-0 pl-8 md:pl-6 flex-[0_0_88%] sm:flex-[0_0_70%] lg:flex-[0_0_66%]"
              >
                <article className="flex w-full flex-col gap-6 rounded-card border border-hairline bg-surface p-8 md:p-12">
                  <h3 className="font-bold text-ink">
                    <span className="mr-2 text-3xl">{slide.flag}</span>
                    <span className="text-2xl md:text-3xl">Learn </span>
                    <span className="accent-glow text-2xl md:text-3xl">{slide.name}</span>
                  </h3>

                  <p className="text-eyebrow uppercase tracking-widest text-gold">{slide.levelsTrack}</p>

                  <div>
                    <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted">What you&apos;ll cover</p>
                    <ul className="space-y-3">
                      {slide.covers.map((cover) => (
                        <li key={cover.pain} className="flex items-start gap-3">
                          <Icon name="check" className="mt-1 shrink-0 text-[18px] text-gold" />
                          <p className="leading-relaxed">
                            <span className="font-medium text-ink">&ldquo;{cover.pain}&rdquo;</span>{" "}
                            <span className="text-gold">→</span>{" "}
                            <span className="text-muted">{cover.solution}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto border-t border-hairline pt-5">
                    <p className="mb-1 text-sm font-bold uppercase tracking-widest text-muted">Outcome</p>
                    <p className="text-ink">{slide.outcome}</p>
                    {slide.link ? (
                      <Link
                        href={slide.link.href}
                        className="mt-4 inline-flex items-center gap-1 font-semibold text-gold hover:underline focus-gold"
                      >
                        {slide.link.label}
                      </Link>
                    ) : null}
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
            aria-label="Previous language"
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
                aria-label={`Go to language ${i + 1}`}
                aria-current={i === selected}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn("h-2 rounded-full transition-all", i === selected ? "w-6 bg-gold" : "w-2 bg-white/20")}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next language"
            onClick={() => emblaApi?.scrollNext()}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink/60 transition-colors hover:border-gold hover:text-gold focus-gold md:flex"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>

      {closing ? (
        <div className="mt-12 flex flex-col items-center gap-6 text-center">
          <p className="max-w-2xl text-muted">{closing}</p>
          <CTAButton label={closingCtaLabel} context="French" waMessage={closingWaMessage} />
        </div>
      ) : null}
    </section>
  );
}
