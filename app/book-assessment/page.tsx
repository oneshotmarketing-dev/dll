import type { Metadata } from "next";
import { AssessmentForm } from "@/components/forms/AssessmentForm";
import { PillBadge } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import { GlowContainer } from "@/components/ui/GlowContainer";
import { buildMetadata } from "@/content/seo";

export const metadata: Metadata = buildMetadata("bookAssessment");

const REASSURANCES = [
  { icon: "schedule", text: "Just 30 minutes — book a time that suits you." },
  { icon: "insights", text: "Know your exact starting level and a realistic timeline." },
  { icon: "lock_open", text: "No commitment, and no payment before you decide." },
];

// Server component reads prefill params from the hero picker / batch cards.
export default function BookAssessmentPage({
  searchParams,
}: {
  searchParams: { lang?: string; goal?: string; batch?: string };
}) {
  return (
    <main>
      <GlowContainer className="mx-auto max-w-container px-5 py-16 md:px-16 md:py-24" glowClassName="h-[240px] w-[520px] top-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: pitch */}
          <div className="space-y-8">
            <PillBadge>Free · 30 minutes · No commitment</PillBadge>
            <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] font-bold leading-[1.05] text-ink">
              Book your free level <span className="accent-gradient">assessment</span>.
            </h1>
            <p className="max-w-md text-lg text-muted">
              Tell us a little about you and your goal. We&apos;ll find your true starting level and
              map an honest, realistic plan — then place you in the right batch.
            </p>
            <ul className="space-y-4">
              {REASSURANCES.map((r) => (
                <li key={r.text} className="flex items-start gap-3 text-muted">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-input bg-gold/10 text-gold">
                    <Icon name={r.icon} className="text-[18px]" />
                  </span>
                  {r.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: form */}
          <div className="rounded-card border border-hairline bg-surface p-6 md:p-8">
            <AssessmentForm
              prefillLang={searchParams.lang}
              prefillGoal={searchParams.goal}
              prefillBatch={searchParams.batch}
            />
          </div>
        </div>
      </GlowContainer>
    </main>
  );
}
