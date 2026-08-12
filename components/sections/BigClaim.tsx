import { AccentTitle } from "@/components/ui/SectionHeading";
import { GlowContainer } from "@/components/ui/GlowContainer";
import type { AccentHeading } from "@/content/types";

// Oversized single claim with clamp() scaling; accent word never wraps mid-word.
export function BigClaim({
  heading,
  footnote,
}: {
  heading: AccentHeading;
  footnote?: string;
}) {
  return (
    <GlowContainer className="mx-auto max-w-container-wide px-5 section-y text-center md:px-16">
      <AccentTitle
        heading={heading}
        accentStyle="gradient"
        className="mx-auto max-w-4xl text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] [text-wrap:balance]"
      />
      {footnote ? (
        <p className="mx-auto mt-6 max-w-2xl text-sm uppercase tracking-[0.2em] text-muted">
          {footnote}
        </p>
      ) : null}
    </GlowContainer>
  );
}
