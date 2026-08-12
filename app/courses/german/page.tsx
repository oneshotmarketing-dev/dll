import type { Metadata } from "next";
import { CoursePageShell } from "@/components/course/CoursePageShell";
import { buildMetadata } from "@/content/seo";
import { courseStubs } from "@/content/courses";

export const metadata: Metadata = buildMetadata("german");

export default function GermanPage() {
  const c = courseStubs.german;
  return (
    <CoursePageShell
      eyebrow={c.eyebrow}
      heading={c.heading}
      blurb={c.blurb}
      bullets={c.bullets}
      ctaContext="German (Goethe)"
      ctaLang="german"
    />
  );
}
