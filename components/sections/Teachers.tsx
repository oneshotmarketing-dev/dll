import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip } from "@/components/ui/PillBadge";
import { Icon } from "@/components/ui/Icon";
import type { Teacher, SectionHeadingContent } from "@/content/types";

// Horizontal snap-scroll with next-card peek on mobile; 4-across on desktop.
export function Teachers({
  heading,
  intro,
  teachers,
  trustLine,
}: {
  heading: SectionHeadingContent;
  intro?: string;
  teachers: Teacher[];
  trustLine?: string;
}) {
  return (
    <section className="mx-auto max-w-container-wide px-5 section-y md:px-16">
      <SectionHeading heading={heading.heading} eyebrow={heading.eyebrow} className="mb-6" />
      {intro ? <p className="mx-auto mb-7 lg:mb-12 max-w-3xl text-center text-lg text-muted">{intro}</p> : <div className="mb-6" />}

      {/* Mobile: snap-scroll w/ peek. Desktop: 4-col grid. */}
      <div className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 md:gap-6 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {teachers.map((teacher) => (
          <div
            key={teacher.name}
            className="flex w-[70%] shrink-0 snap-center flex-col items-center text-center md:w-auto"
          >
            <div className="mb-6 h-40 w-40 overflow-hidden rounded-full border-2 border-gold/30 p-1 shadow-glow-card">
              {teacher.image ? (
                <Image
                  src={teacher.image.src}
                  alt={teacher.image.alt}
                  width={200}
                  height={200}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white/5 text-gold">
                  <Icon name="person" className="text-6xl" />
                </div>
              )}
            </div>
            <h3 className="mb-2 text-xl font-bold text-ink">{teacher.name}</h3>
            <Chip className="mb-3">{teacher.credential}</Chip>
            <p className="max-w-[280px] text-sm leading-relaxed text-muted">{teacher.blurb}</p>
          </div>
        ))}
      </div>

      {trustLine ? <p className="mt-12 text-center text-muted">{trustLine}</p> : null}
    </section>
  );
}
