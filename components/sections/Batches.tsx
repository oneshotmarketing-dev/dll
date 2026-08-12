import { SectionHeading } from "@/components/ui/SectionHeading";
import { BatchCard } from "./BatchCard";
import { cn } from "@/lib/cn";
import type { Batch, SectionHeadingContent } from "@/content/types";

// Stacked full-width on mobile with the FEATURED card first; 3-across desktop
// keeping the export's original order.
export function Batches({
  heading,
  batches,
  ctaLabel,
  footnote,
}: {
  heading: SectionHeadingContent;
  batches: Batch[];
  ctaLabel: string;
  footnote?: string;
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} className="mb-7 lg:mb-14" />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {batches.map((batch, i) => (
          <div
            key={batch.title}
            className={cn(batch.featured ? "order-first lg:order-none" : "", i > 0 && batch.featured ? "" : "")}
          >
            <BatchCard batch={batch} ctaLabel={ctaLabel} />
          </div>
        ))}
      </div>

      {footnote ? <p className="mt-10 text-center text-muted">{footnote}</p> : null}
    </section>
  );
}
