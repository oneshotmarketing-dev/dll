import Image from "next/image";
import type { AboutFounderContent } from "@/content/types";

// Founder: square rounded portrait (teacher-card style, but larger) left,
// bio + serif-italic gold pull-quote right.
export function AboutFounder({ content }: { content: AboutFounderContent }) {
  return (
    <section className="mx-auto max-w-container px-5 section-y md:px-16">
      <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <div className="overflow-hidden rounded-card border border-gold/30 p-1 shadow-glow-card">
            <Image
              src={content.image.src}
              alt={content.image.alt}
              width={520}
              height={520}
              className="aspect-square w-full rounded-[16px] object-cover"
            />
          </div>
        </div>

        <div className="space-y-6 md:col-span-6 md:col-start-7">
          <span className="block text-eyebrow uppercase text-gold">{content.eyebrow}</span>
          <div>
            <h2 className="text-2xl font-bold text-ink md:text-3xl">{content.name}</h2>
            <p className="mt-1 text-gold">{content.role}</p>
          </div>

          {content.paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-muted">
              {p}
            </p>
          ))}

          <blockquote className="accent-glow border-l-2 border-gold pl-6 text-xl leading-snug md:text-2xl">
            &ldquo;{content.pullQuote}&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  );
}
