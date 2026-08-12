import type { Metadata } from "next";
import { CoursePageShell } from "@/components/course/CoursePageShell";
import { buildMetadata } from "@/content/seo";
import { courseStubs } from "@/content/courses";

export const metadata: Metadata = buildMetadata("ielts");

export default function IeltsPage() {
  const c = courseStubs.ielts;
  return (
    <CoursePageShell
      eyebrow={c.eyebrow}
      heading={c.heading}
      blurb={c.blurb}
      bullets={c.bullets}
      ctaContext="IELTS English"
      ctaLang="ielts"
    />
  );
}
