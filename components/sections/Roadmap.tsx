import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import type { RoadmapStep, SectionHeadingContent } from "@/content/types";

// Mobile: single left vertical line, text then image stacked per step (no
// alternating). Desktop (md+): alternating around a centered line, matching the
// approved export.
export function Roadmap({
  heading,
  steps,
}: {
  heading: SectionHeadingContent;
  steps: RoadmapStep[];
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} eyebrow={heading.eyebrow} className="mb-8 md:mb-16 lg:mb-24" />

      <div className="relative mx-auto max-w-5xl space-y-14 md:space-y-28">
        {/* Vertical line: left on mobile, centered on desktop. */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-gold via-gold/20 to-transparent md:left-1/2 md:-translate-x-1/2"
        />

        {steps.map((step, i) => {
          const reversed = i % 2 === 1;
          return (
            <div
              key={step.number}
              className={cn(
                "relative flex flex-col gap-6 pl-16 md:flex-row md:items-center md:gap-12 md:pl-0",
                reversed && "md:flex-row-reverse",
              )}
            >
              {/* Text */}
              <div className={cn("space-y-4 md:w-1/2", reversed ? "md:text-left" : "md:text-right")}>
                <h3 className="text-2xl font-bold text-ink md:text-3xl">{step.title}</h3>
                <p className="text-lg text-muted">{step.body}</p>
              </div>

              {/* Number badge — on the line */}
              <div className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-cta-gradient font-display text-2xl text-canvas shadow-glow-btn md:static md:h-20 md:w-20 md:text-4xl">
                {step.number}
              </div>

              {/* Image */}
              <div className="md:w-1/2">
                {step.image ? (
                  <div className="w-full overflow-hidden rounded-card border border-gold/20 bg-surface p-2">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      width={520}
                      height={220}
                      className="h-40 w-full rounded-xl object-cover md:h-48"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
