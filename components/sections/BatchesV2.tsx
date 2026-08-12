import { SectionHeading } from "@/components/ui/SectionHeading";
import { BatchCardV2 } from "./BatchCardV2";
import type { Batch, SectionHeadingContent } from "@/content/types";

/**
 * BatchesV2 — same layout as Batches (featured-first on mobile, 3-across
 * desktop) but renders BatchCardV2 (illustration header). Adds an intro line.
 */
export function BatchesV2({
  heading,
  intro,
  batches,
  ctaLabel,
  footnote,
}: {
  heading: SectionHeadingContent;
  intro?: string;
  batches: Batch[];
  ctaLabel: string;
  footnote?: string;
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} className={intro ? "mb-4" : "mb-7 lg:mb-14"} />
      {intro ? <p className="mx-auto mb-7 lg:mb-14 max-w-2xl text-center text-muted">{intro}</p> : null}

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {batches.map((batch) => (
          <div key={batch.title} className={batch.featured ? "order-first lg:order-none" : ""}>
            <BatchCardV2 batch={batch} ctaLabel={ctaLabel} />
          </div>
        ))}
      </div>

      {footnote ? <p className="mx-auto mt-10 max-w-2xl text-center text-muted">{footnote}</p> : null}
    </section>
  );
}
