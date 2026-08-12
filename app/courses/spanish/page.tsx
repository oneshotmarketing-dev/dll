import type { Metadata } from "next";
import { CoursePageShell } from "@/components/course/CoursePageShell";
import { buildMetadata } from "@/content/seo";
import { courseStubs } from "@/content/courses";

export const metadata: Metadata = buildMetadata("spanish");

export default function SpanishPage() {
  const c = courseStubs.spanish;
  return (
    <CoursePageShell
      eyebrow={c.eyebrow}
      heading={c.heading}
      blurb={c.blurb}
      bullets={c.bullets}
      ctaContext="Spanish (DELE)"
      ctaLang="spanish"
    />
  );
}
