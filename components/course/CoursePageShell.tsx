import { AccentTitle } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import { GlowContainer } from "@/components/ui/GlowContainer";
import type { AccentHeading } from "@/content/types";

// Shared "coming soon" shell for Spanish / German / IELTS / Free Resources.
// One CTA, no competing buttons. Interim form of Phase-0 course pages.
export function CoursePageShell({
  eyebrow,
  heading,
  blurb,
  bullets,
  ctaContext,
  ctaLang,
}: {
  eyebrow: string;
  heading: AccentHeading;
  blurb: string;
  bullets: string[];
  ctaContext: string;
  ctaLang?: string;
}) {
  return (
    <main>
      <GlowContainer className="mx-auto max-w-container px-5 py-24 text-center md:px-16 md:py-32">
        <div className="flex flex-col items-center gap-8">
          <PillBadge icon="rocket_launch">{eyebrow}</PillBadge>
          <AccentTitle
            as="h1"
            heading={heading}
            accentStyle="gradient"
            className="max-w-3xl text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05]"
          />
          <p className="max-w-xl text-lg text-muted">{blurb}</p>

          <ul className="flex flex-wrap justify-center gap-3">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 rounded-pill border border-hairline bg-surface px-4 py-2 text-sm text-muted"
              >
                <Icon name="check" className="text-[16px] text-gold" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <CTAButton label="Book a free level assessment" context={ctaContext} lang={ctaLang} />
          </div>
        </div>
      </GlowContainer>
    </main>
  );
}
