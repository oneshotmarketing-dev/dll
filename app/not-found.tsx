import Link from "next/link";
import { CTAButton } from "@/components/ui/CTAButton";
import { GlowContainer } from "@/components/ui/GlowContainer";

// On-brand 404.
export default function NotFound() {
  return (
    <main>
      <GlowContainer className="mx-auto flex max-w-container flex-col items-center gap-6 px-5 py-32 text-center md:px-16">
        <p className="font-display text-[clamp(5rem,20vw,10rem)] leading-none text-gold/30">404</p>
        <h1 className="text-3xl font-bold text-ink md:text-4xl">
          This page took a <span className="accent-gradient">détour</span>.
        </h1>
        <p className="max-w-md text-muted">
          The page you&apos;re looking for isn&apos;t here. Let&apos;s get you back on track — or
          start with a free level assessment.
        </p>
        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <CTAButton label="Book a free level assessment" context="404 page" />
          <Link href="/" className="text-muted underline-offset-4 hover:text-gold hover:underline focus-gold">
            Back to home
          </Link>
        </div>
      </GlowContainer>
    </main>
  );
}
