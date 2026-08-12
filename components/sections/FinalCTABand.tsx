import { AccentTitle } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { GlowContainer } from "@/components/ui/GlowContainer";
import type { FinalCtaContent } from "@/content/types";

// Full-width closing band with faint radial gold glow behind (one of the two
// places glow is allowed). Full-width button + scaled text on mobile.
export function FinalCTABand({
  content,
  context,
}: {
  content: FinalCtaContent;
  context: string;
}) {
  return (
    <section className="w-full overflow-hidden section-y">
      <GlowContainer className="mx-auto max-w-3xl px-5 text-center md:px-16" glowClassName="h-[300px] w-[800px]">
        <div className="flex flex-col items-center gap-6">
          <AccentTitle
            heading={content.heading}
            accentStyle="gradient"
            className="text-[clamp(2.25rem,6vw,4rem)] leading-tight"
          />
          {content.body ? <p className="text-lg text-muted">{content.body}</p> : null}
          <div className="mt-2 w-full sm:w-auto">
            <CTAButton
              label={content.ctaLabel}
              context={context}
              waMessage={content.waMessage}
              fullWidth
              className="sm:w-auto"
            />
          </div>
        </div>
      </GlowContainer>
    </section>
  );
}
