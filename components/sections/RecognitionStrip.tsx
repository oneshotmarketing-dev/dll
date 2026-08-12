import type { RecognitionContent } from "@/content/types";

// Horizontal snap-scroll on mobile so logos never shrink unreadably; wraps
// centered on desktop.
export function RecognitionStrip({ content }: { content: RecognitionContent }) {
  return (
    <section className="w-full bg-gradient-to-r from-transparent via-gold/5 to-transparent px-5 py-10 md:px-16">
      <div className="mx-auto flex max-w-container-wide flex-col items-center gap-5 text-center">
        <p className="text-muted">{content.caption}</p>
        <div className="hide-scrollbar flex w-full snap-x snap-mandatory items-center justify-start gap-4 overflow-x-auto md:flex-wrap md:justify-center md:gap-8">
          {content.logos.map((logo, i) => (
            <div key={logo} className="flex shrink-0 snap-center items-center gap-4">
              {i > 0 ? <span className="hidden text-gold/40 md:inline">·</span> : null}
              <span className="whitespace-nowrap text-eyebrow uppercase tracking-widest text-ink/80">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
