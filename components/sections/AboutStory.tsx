import { type ReactNode } from "react";
import Image from "next/image";
import { AccentTitle } from "@/components/ui/SectionHeading";
import type { AboutStoryContent, AboutFounderContent } from "@/content/types";

/**
 * Editorial two-column story (lg+). Left: eyebrow + accent heading top-aligned
 * with the right column's first paragraph, then Deepa's portrait as the anchor
 * (fills the column, square-rounded, with a hero-style caption plate overlapping
 * the bottom-left corner). Right: the paragraphs on a gold "timeline" spine (dot
 * per paragraph: frustration → pattern → solution) with a gold drop cap, and the
 * key rule pulled out as a styled serif inset between paragraphs 2 and 3. Loose
 * leading balances the right column's height against the photo-anchored left.
 * Mobile stacks: heading → photo (full-width, plate bottom-left) → paragraphs.
 */
export function AboutStory({
  content,
  founder,
}: {
  content: AboutStoryContent;
  founder: AboutFounderContent;
}) {
  // Flat list so `space-y` spacing applies to every row (paragraphs + pull-out).
  const rows: ReactNode[] = [];
  content.paragraphs.forEach((p, i) => {
    rows.push(
      <div key={`p-${i}`} className="relative">
        <span
          aria-hidden="true"
          className="absolute -left-8 top-[0.55em] h-2 w-2 -translate-x-1/2 rounded-full bg-gold"
        />
        {i === 0 ? (
          <p className="text-lg leading-loose text-muted">
            <span className="float-left mr-2 font-serif text-[3.25rem] font-bold leading-[0.8] text-gold">
              {p.charAt(0)}
            </span>
            {p.slice(1)}
          </p>
        ) : (
          <p className="text-lg leading-loose text-muted">{p}</p>
        )}
      </div>,
    );

    // Pulled-out rule inset — between paragraph 2 and paragraph 3.
    if (i === 1 && content.rule) {
      rows.push(
        <div key="rule" className="relative">
          <span aria-hidden="true" className="mb-3 block h-px w-12 bg-gold/60" />
          <p className="font-serif text-2xl italic leading-snug text-ink">
            {content.rule.before} <span className="accent-glow">{content.rule.accent}</span>
            {content.rule.after ?? ""}
          </p>
          <span aria-hidden="true" className="mt-3 block h-px w-12 bg-gold/60" />
        </div>,
      );
    }
  });

  return (
    <section className="mx-auto max-w-container px-5 section-y md:px-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* LEFT — heading (top-aligned with p1) then the photo as the anchor */}
        <div className="lg:col-span-5">
          <span className="mb-4 block text-eyebrow uppercase text-gold">{content.eyebrow}</span>
          <AccentTitle heading={content.heading} className="text-3xl md:text-4xl" />

          {/* Photo fills the column; caption plate overlaps the bottom-left
              corner in the hero LIVE-card language (dark surface, gold border). */}
          <figure className="relative mt-10 mb-8 w-full max-w-[420px]">
            <div className="overflow-hidden rounded-[20px] border border-gold/30 p-1 shadow-glow-card">
              <Image
                src={founder.image.src}
                alt={founder.image.alt}
                width={440}
                height={440}
                className="aspect-square w-full rounded-[16px] object-cover"
              />
            </div>
            <figcaption className="absolute -bottom-5 left-4 rounded-card border border-gold bg-surface/95 px-5 py-3 shadow-glow-card backdrop-blur">
              <p className="font-medium leading-tight text-ink">{founder.name}</p>
              <p className="text-sm text-muted">{founder.role}</p>
            </figcaption>
          </figure>
        </div>

        {/* RIGHT — paragraphs on a gold timeline spine + pulled-out rule */}
        <div className="lg:col-span-6 lg:col-start-7">
          <div className="relative pl-8">
            <span aria-hidden="true" className="absolute bottom-3 left-0 top-2 w-px bg-gold/30" />
            <div className="space-y-9">{rows}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
