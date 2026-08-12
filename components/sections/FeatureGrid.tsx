import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Feature, SectionHeadingContent } from "@/content/types";

// 1 col mobile / 2 md / 2×2 desktop. A `featured` tile gets the gold glow.
export function FeatureGrid({
  heading,
  features,
}: {
  heading: SectionHeadingContent;
  features: Feature[];
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} eyebrow={heading.eyebrow} className="mb-7 lg:mb-12" />
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={cn(
              "group relative overflow-hidden rounded-card bg-surface p-8 transition-colors md:p-10",
              feature.featured
                ? "border border-gold shadow-glow-card"
                : "border border-hairline hover:border-gold/30",
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-gold/10 blur-3xl transition-all group-hover:bg-gold/20"
            />
            <span className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-input bg-gold/10 text-gold">
              <Icon name={feature.icon} className="text-3xl" />
            </span>
            <h3 className="relative mb-3 text-xl font-bold text-ink">{feature.title}</h3>
            <p className="relative text-muted">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
