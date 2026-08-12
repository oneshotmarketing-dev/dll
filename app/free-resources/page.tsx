import type { Metadata } from "next";
import { AccentTitle } from "@/components/ui/SectionHeading";
import { CTAButton } from "@/components/ui/CTAButton";
import { PillBadge } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import { GlowContainer } from "@/components/ui/GlowContainer";
import { buildMetadata } from "@/content/seo";
import { freeResources } from "@/content/courses";

export const metadata: Metadata = buildMetadata("freeResources");

export default function FreeResourcesPage() {
  return (
    <main>
      <GlowContainer className="mx-auto max-w-container px-5 py-24 md:px-16 md:py-28">
        <div className="mb-7 lg:mb-14 flex flex-col items-center gap-6 text-center">
          <PillBadge icon="auto_stories">{freeResources.eyebrow}</PillBadge>
          <AccentTitle
            as="h1"
            heading={freeResources.heading}
            accentStyle="gradient"
            className="max-w-3xl text-[clamp(2.25rem,6vw,4rem)] leading-[1.05]"
          />
          <p className="max-w-xl text-lg text-muted">{freeResources.blurb}</p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {freeResources.planned.map((r) => (
            <div key={r.title} className="rounded-card border border-hairline bg-surface p-8">
              <Icon name="lock_clock" className="mb-4 text-3xl text-gold" />
              <h2 className="mb-2 text-lg font-bold text-ink">{r.title}</h2>
              <p className="text-sm text-muted">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <CTAButton label="Book a free level assessment" context="Free Resources" />
        </div>
      </GlowContainer>
    </main>
  );
}
