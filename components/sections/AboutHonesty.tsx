import { AccentTitle } from "@/components/ui/SectionHeading";
import type { AboutHonestyContent } from "@/content/types";

// "What we're not" — the honesty block. Dark card, gold border, one row per
// point (gold marker + bold-white lead + muted rest). This section is the
// page's quiet conversion engine: every line refuses something a scam would sell.
export function AboutHonesty({ content }: { content: AboutHonestyContent }) {
  return (
    <section className="mx-auto max-w-container px-5 section-y md:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <span className="mb-4 block text-eyebrow uppercase text-gold">{content.eyebrow}</span>
          <AccentTitle heading={content.heading} className="text-3xl md:text-4xl" />
        </div>
        <p className="mb-8 text-center text-muted">{content.intro}</p>

        <div className="rounded-card border border-gold bg-surface p-6 shadow-glow-card md:p-8">
          <ul className="divide-y divide-hairline">
            {content.points.map((pt) => (
              <li key={pt.lead} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                <p className="leading-relaxed">
                  <span className="font-bold text-ink">{pt.lead}</span>{" "}
                  <span className="text-muted">{pt.rest}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
